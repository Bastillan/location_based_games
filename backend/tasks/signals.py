from django.dispatch import receiver
from djoser.signals import user_activated
from tasks.models import User
import logging

logger = logging.getLogger(__name__)


@receiver(user_activated)
def create_user_profile(sender, user, request, **kwargs):
    logger.info(f"User activated signal received for user: {user.id}")

    User.objects.get_or_create(user=user)
    logger.info(f"User profile created or fetched for user: {user.id}")
