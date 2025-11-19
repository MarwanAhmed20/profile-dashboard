from django.core.management.base import BaseCommand
from apps.students.models import Domain, Student, StudentDomainScore, DomainStrength, DomainWeakness

class Command(BaseCommand):
    help = 'Setup ML/AI domains with sample data'

    def handle(self, *args, **options):
        # Clear existing domains
        self.stdout.write('Clearing old domains...')
        Domain.objects.all().delete()
        
        # Create new ML/AI domains
        domains_data = [
            {'name': 'Mathematics & Statistics', 'description': 'Linear algebra, calculus, probability & statistics', 'order': 1},
            {'name': 'Machine Learning', 'description': 'Supervised & unsupervised learning algorithms', 'order': 2},
            {'name': 'Deep Learning', 'description': 'Neural networks, CNNs, RNNs, transformers', 'order': 3},
            {'name': 'Data Science', 'description': 'Data analysis, visualization, feature engineering', 'order': 4},
            {'name': 'Computer Vision', 'description': 'Image processing, object detection, segmentation', 'order': 5},
            {'name': 'Natural Language Processing', 'description': 'Text processing, sentiment analysis, language models', 'order': 6},
            {'name': 'Generative AI', 'description': 'GANs, VAEs, diffusion models, LLMs', 'order': 7},
            {'name': 'Deployment', 'description': 'MLOps, model serving, cloud deployment', 'order': 8},
            {'name': 'Portfolio', 'description': 'Projects, documentation, GitHub presence', 'order': 9},
        ]
        
        self.stdout.write('Creating new domains...')
        created_domains = []
        for d in domains_data:
            domain = Domain.objects.create(**d)
            created_domains.append(domain)
            self.stdout.write(self.style.SUCCESS(f'  ✓ Created: {domain.name}'))
        
        # Update existing students with new domains
        students = Student.objects.all()
        if students.exists():
            self.stdout.write(f'\nUpdating {students.count()} student(s) with new domains...')
            
            sample_scores = [85, 80, 75, 82, 70, 78, 88, 65, 90]
            
            for student in students:
                # Clear old domain scores
                student.domain_scores.all().delete()
                
                # Add new domain scores
                for domain, score in zip(created_domains, sample_scores):
                    domain_score = StudentDomainScore.objects.create(
                        student=student,
                        domain=domain,
                        score=score
                    )
                    
                    # Add sample strengths
                    if score >= 80:
                        DomainStrength.objects.create(
                            student_domain=domain_score,
                            title='Strong understanding',
                            description=f'Excellent grasp of {domain.name} concepts'
                        )
                    
                    # Add sample weaknesses
                    if score < 80:
                        DomainWeakness.objects.create(
                            student_domain=domain_score,
                            title='Needs improvement',
                            description=f'Could benefit from more practice in {domain.name}',
                            improvement_suggestion='Complete more hands-on projects and exercises'
                        )
                
                self.stdout.write(f'  ✓ Updated: {student.user.get_full_name()}')
        
        self.stdout.write(self.style.SUCCESS('\n✅ ML/AI domains setup complete!'))
