from rest_framework import serializers
from .models import Vendor, VendorBankDetail

class VendorBankDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorBankDetail
        fields = '__all__'

class VendorSerializer(serializers.ModelSerializer):
    bank_details = VendorBankDetailSerializer(many=True, read_only=True)

    class Meta:
        model = Vendor
        fields = '__all__'

    def validate_gstin(self, value):
        import re
        gst_regex = r'^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$'
        if not re.match(gst_regex, value):
            raise serializers.ValidationError("Invalid Indian GSTIN structure. Must be 15 alphanumeric characters matching state and PAN pattern.")
        return value.upper()
