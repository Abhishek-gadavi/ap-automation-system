import uuid
from django.db import models

class NotificationType(models.TextChoices):
    NEW_INVOICE_SUBMISSION = 'NEW_INVOICE_SUBMISSION', 'New Invoice Submission'
    PENDING_APPROVAL = 'PENDING_APPROVAL', 'Pending Approval'
    INVOICE_APPROVED = 'INVOICE_APPROVED', 'Invoice Approved'
    INVOICE_REJECTED = 'INVOICE_REJECTED', 'Invoice Rejected'
    PAYMENT_COMPLETED = 'PAYMENT_COMPLETED', 'Payment Completed'
    APPROVAL_REMINDER = 'APPROVAL_REMINDER', 'Approval Reminder'
    ESCALATION_ALERT = 'ESCALATION_ALERT', 'SLA Escalation Alert'

class Notification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient_email = models.EmailField(max_length=255)
    recipient_role = models.CharField(max_length=64, default='FINANCE_EMPLOYEE')
    notification_type = models.CharField(max_length=64, choices=NotificationType.choices)
    title = models.CharField(max_length=255)
    message = models.TextField()
    entity_id = models.CharField(max_length=100, blank=True, null=True)
    is_read = models.BooleanField(default=False)
    email_dispatched = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.notification_type}] {self.title}"
