from djoser import email


class PasswordResetEmail(email.PasswordResetEmail):
    template_name = 'password_reset.html'

class ActivationEmail(email.ActivationEmail):
    template_name = 'account_activation.html'
