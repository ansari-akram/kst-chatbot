from django.contrib import admin
from .models import Log, ChatbotUser

class ChatbotUserAdmin(admin.ModelAdmin):
    list_display = ["username", "email", "phone", "id"]

class LogAdmin(admin.ModelAdmin):
    list_display = ["question", "answer", "user", "time"]

admin.site.register(ChatbotUser, ChatbotUserAdmin)
admin.site.register(Log, LogAdmin)