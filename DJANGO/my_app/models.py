from django.db import models

class ChatbotUser(models.Model):
    username = models.CharField(max_length=100, unique=True)
    email = models.EmailField(unique=True)
    phone = models.IntegerField()

    def __str__(self) -> str:
        return str(self.email)


class Log(models.Model):
    user = models.ForeignKey(ChatbotUser, on_delete=models.CASCADE)
    question = models.TextField()
    answer = models.TextField()
    time = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return str(self.user.email)