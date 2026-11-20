"""
PO Matching Engine
Executes:
1. 2-Way Matching (PO vs Invoice)
2. 3-Way Matching (PO vs GRN vs Invoice)
Applies configurable tolerances and highlights line-level variances.
"""

from decimal import Decimal
from apps.invoices.models import MatchStatus, MatchingType, InvoiceStatus

class POMatchingEngine:
    DEFAULT_PRICE_TOLERANCE_PCT = Decimal('2.0')  # 2% price variance tolerated
    DEFAULT_QTY_TOLERANCE_PCT = Decimal('0.0')    # 0% quantity variance (must not bill for unreceived goods)

    @classmethod
    def execute_match(cls, invoice, matching_type=MatchingType.THREE_WAY):
        po = invoice.po
        grn = invoice.grn

        if not po:
            return {
                "status": MatchStatus.PENDING,
                "reason": "No linked Purchase Order found for matching.",
                "discrepancies": []
            }

        discrepancies = []
        inv_lines = invoice.line_items.all()
        po_lines = {item.item_code: item for item in po.line_items.all()}

        grn_lines = {}
        if grn and matching_type == MatchingType.THREE_WAY:
            grn_lines = {item.item_code: item for item in grn.line_items.all()}

        total_inv_price = Decimal('0.00')
        total_po_price = Decimal('0.00')

        for inv_line in inv_lines:
            total_inv_price += inv_line.total_price
            po_item = po_lines.get(inv_line.item_code)

            if not po_item:
                discrepancies.append({
                    "item_code": inv_line.item_code,
                    "type": "UNAUTHORIZED_ITEM",
                    "description": f"Item {inv_line.item_code} appears on invoice but does not exist in PO {po.po_number}."
                })
                continue

            total_po_price += po_item.total_price

            # Price Comparison
            price_diff = abs(inv_line.unit_price - po_item.unit_price)
            price_variance_pct = (price_diff / po_item.unit_price) * 100 if po_item.unit_price > 0 else 0
            if price_variance_pct > cls.DEFAULT_PRICE_TOLERANCE_PCT:
                discrepancies.append({
                    "item_code": inv_line.item_code,
                    "type": "PRICE_MISMATCH",
                    "invoice_price": float(inv_line.unit_price),
                    "po_price": float(po_item.unit_price),
                    "variance_pct": float(price_variance_pct),
                    "message": f"Unit price ({inv_line.unit_price}) differs from PO price ({po_item.unit_price}) by {price_variance_pct:.2f}%."
                })

            # Quantity Comparison: PO vs Invoice (2-way)
            if matching_type == MatchingType.TWO_WAY:
                if inv_line.quantity > po_item.quantity:
                    discrepancies.append({
                        "item_code": inv_line.item_code,
                        "type": "QUANTITY_EXCEEDED",
                        "invoice_qty": float(inv_line.quantity),
                        "po_qty": float(po_item.quantity),
                        "message": f"Invoiced quantity ({inv_line.quantity}) exceeds PO quantity ({po_item.quantity})."
                    })

            # 3-Way Matching: Check against GRN accepted quantity
            if matching_type == MatchingType.THREE_WAY:
                grn_item = grn_lines.get(inv_line.item_code)
                if not grn_item:
                    discrepancies.append({
                        "item_code": inv_line.item_code,
                        "type": "NO_GRN_RECORD",
                        "message": f"No Goods Receipt Note found for item {inv_line.item_code}."
                    })
                elif inv_line.quantity > grn_item.quantity_accepted:
                    discrepancies.append({
                        "item_code": inv_line.item_code,
                        "type": "GRN_QUANTITY_MISMATCH",
                        "invoice_qty": float(inv_line.quantity),
                        "grn_accepted_qty": float(grn_item.quantity_accepted),
                        "message": f"Billed quantity ({inv_line.quantity}) exceeds warehouse received quantity ({grn_item.quantity_accepted})."
                    })

        # Total Header Variance
        total_variance = abs(invoice.total_amount - po.total_amount)
        total_variance_pct = (total_variance / po.total_amount) * 100 if po.total_amount > 0 else 0

        # Determine Final Status
        if len(discrepancies) == 0:
            if total_variance_pct == 0:
                final_status = MatchStatus.MATCHED_EXACT
            else:
                final_status = MatchStatus.MATCHED_WITHIN_TOLERANCE
            invoice.status = InvoiceStatus.PENDING_APPROVAL
        else:
            # Check primary discrepancy
            disc_types = [d['type'] for d in discrepancies]
            if 'PRICE_MISMATCH' in disc_types:
                final_status = MatchStatus.DISCREPANCY_PRICE
            elif 'QUANTITY_EXCEEDED' in disc_types or 'GRN_QUANTITY_MISMATCH' in disc_types:
                final_status = MatchStatus.DISCREPANCY_QTY
            else:
                final_status = MatchStatus.DISCREPANCY_TOTAL
            invoice.status = InvoiceStatus.MATCHING_FAILED

        invoice.matching_status = final_status
        invoice.save()

        return {
            "matching_type": matching_type,
            "overall_status": final_status,
            "price_variance_pct": float(round((abs(total_inv_price - total_po_price) / total_po_price * 100), 2)) if total_po_price > 0 else 0.0,
            "total_variance_amount": float(total_variance),
            "discrepancies": discrepancies
        }
