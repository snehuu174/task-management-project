from django.db import models


class Task(models.Model):
    class Status(models.TextChoices):
        TODO = 'TODO', 'To Do'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        IN_REVIEW = 'IN_REVIEW', 'In Review'
        COMPLETED = 'COMPLETED', 'Completed'
        CANCELLED = 'CANCELLED', 'Cancelled'

    class Priority(models.TextChoices):
        LOW = 'LOW', 'Low'
        MEDIUM = 'MEDIUM', 'Medium'
        HIGH = 'HIGH', 'High'
        URGENT = 'URGENT', 'Urgent'

    title = models.CharField(max_length=200)
    brief = models.TextField(blank=True)
    assignee = models.CharField(max_length=100, blank=True)
    project = models.CharField(max_length=100, blank=True)
    due_date = models.DateField(null=True, blank=True)
    priority = models.CharField(
        max_length=20,
        choices=Priority.choices,
        default=Priority.MEDIUM,
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.TODO,
    )
    created_by = models.ForeignKey(
        'task_user.TaskUser',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tasks_created',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'task'
        ordering = ['-created_at']

    def __str__(self):
        return self.title