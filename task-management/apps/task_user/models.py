from django.db import models

# Create your models here.
class TaskUser(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    password = models.CharField(max_length=100)
    status = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'task_user'
        verbose_name = 'Task User'
        verbose_name_plural = 'Task Users'
        
    def __str__(self):
            return self.name