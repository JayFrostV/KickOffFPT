using Microsoft.EntityFrameworkCore;
using QuizApp.Domain.Entities;
using QuizApp.Domain.Enums;

namespace QuizApp.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<QuestionBank> QuestionBanks => Set<QuestionBank>();
    public DbSet<Question> Questions => Set<Question>();
    public DbSet<Answer> Answers => Set<Answer>();
    public DbSet<Quiz> Quizzes => Set<Quiz>();
    public DbSet<QuizQuestion> QuizQuestions => Set<QuizQuestion>();
    public DbSet<QuizAttempt> QuizAttempts => Set<QuizAttempt>();
    public DbSet<AttemptAnswer> AttemptAnswers => Set<AttemptAnswer>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── User ──────────────────────────────────────────────────────────────
        modelBuilder.Entity<User>(e =>
        {
            e.ToTable("User");
            e.HasKey(u => u.UserId);
            e.Property(u => u.UserId).HasColumnName("user_id").UseIdentityColumn();
            e.Property(u => u.Username).HasColumnName("username").HasMaxLength(100).IsRequired();
            e.Property(u => u.Email).HasColumnName("email").HasMaxLength(255).IsRequired();
            e.Property(u => u.PasswordHash).HasColumnName("password_hash").IsRequired();
            e.Property(u => u.Role).HasColumnName("role").HasMaxLength(50).IsRequired().HasConversion<string>();
            e.Property(u => u.IsActive).HasColumnName("is_active").IsRequired();
            e.Property(u => u.CreatedAt).HasColumnName("created_at").HasColumnType("datetime2").IsRequired();
            e.HasIndex(u => u.Email).IsUnique();
            e.HasIndex(u => u.Username).IsUnique();
        });

        // ── QuestionBank ──────────────────────────────────────────────────────
        modelBuilder.Entity<QuestionBank>(e =>
        {
            e.ToTable("QuestionBank");
            e.HasKey(b => b.BankId);
            e.Property(b => b.BankId).HasColumnName("bank_id").UseIdentityColumn();
            e.Property(b => b.OwnerId).HasColumnName("owner_id");
            e.Property(b => b.Name).HasColumnName("name").HasMaxLength(255).IsRequired();
            e.Property(b => b.Description).HasColumnName("description").HasColumnType("nvarchar(max)");
            e.Property(b => b.Visibility).HasColumnName("visibility").HasMaxLength(50).IsRequired().HasConversion<string>();
            e.Property(b => b.CreatedAt).HasColumnName("created_at").HasColumnType("datetime2").IsRequired();
            e.HasOne(b => b.Owner)
                .WithMany(u => u.QuestionBanks)
                .HasForeignKey(b => b.OwnerId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ── Question ──────────────────────────────────────────────────────────
        modelBuilder.Entity<Question>(e =>
        {
            e.ToTable("Question");
            e.HasKey(q => q.QuestionId);
            e.Property(q => q.QuestionId).HasColumnName("question_id").UseIdentityColumn();
            e.Property(q => q.BankId).HasColumnName("bank_id");
            e.Property(q => q.Content).HasColumnName("content").HasColumnType("nvarchar(max)").IsRequired();
            e.Property(q => q.QuestionType).HasColumnName("question_type").HasMaxLength(50).IsRequired().HasConversion<string>();
            e.HasOne(q => q.Bank)
                .WithMany(b => b.Questions)
                .HasForeignKey(q => q.BankId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ── Answer ────────────────────────────────────────────────────────────
        modelBuilder.Entity<Answer>(e =>
        {
            e.ToTable("Answer");
            e.HasKey(a => a.AnswerId);
            e.Property(a => a.AnswerId).HasColumnName("answer_id").UseIdentityColumn();
            e.Property(a => a.QuestionId).HasColumnName("question_id");
            e.Property(a => a.Content).HasColumnName("content").HasColumnType("nvarchar(max)").IsRequired();
            e.Property(a => a.IsCorrect).HasColumnName("is_correct").IsRequired();
            e.HasOne(a => a.Question)
                .WithMany(q => q.Answers)
                .HasForeignKey(a => a.QuestionId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ── Quiz ──────────────────────────────────────────────────────────────
        modelBuilder.Entity<Quiz>(e =>
        {
            e.ToTable("Quiz");
            e.HasKey(q => q.QuizId);
            e.Property(q => q.QuizId).HasColumnName("quiz_id").UseIdentityColumn();
            e.Property(q => q.CreatorId).HasColumnName("creator_id");
            e.Property(q => q.Title).HasColumnName("title").HasMaxLength(255).IsRequired();
            e.Property(q => q.Description).HasColumnName("description").HasColumnType("nvarchar(max)");
            e.Property(q => q.Duration).HasColumnName("duration").IsRequired();
            e.Property(q => q.Visibility).HasColumnName("visibility").HasMaxLength(50).IsRequired().HasConversion<string>();
            e.Property(q => q.CreatedAt).HasColumnName("created_at").HasColumnType("datetime2").IsRequired();
            e.HasOne(q => q.Creator)
                .WithMany(u => u.Quizzes)
                .HasForeignKey(q => q.CreatorId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ── QuizQuestion (junction) ────────────────────────────────────────────
        modelBuilder.Entity<QuizQuestion>(e =>
        {
            e.ToTable("QuizQuestion");
            e.HasKey(qq => qq.QuizQuestionId);
            e.Property(qq => qq.QuizQuestionId).HasColumnName("quiz_question_id").UseIdentityColumn();
            e.Property(qq => qq.QuizId).HasColumnName("quiz_id");
            e.Property(qq => qq.QuestionId).HasColumnName("question_id");
            e.Property(qq => qq.OrderIndex).HasColumnName("order_index").IsRequired();
            e.HasOne(qq => qq.Quiz)
                .WithMany(q => q.QuizQuestions)
                .HasForeignKey(qq => qq.QuizId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(qq => qq.Question)
                .WithMany(q => q.QuizQuestions)
                .HasForeignKey(qq => qq.QuestionId)
                .OnDelete(DeleteBehavior.Restrict);  // Don't delete question when removed from quiz
            e.HasIndex(qq => new { qq.QuizId, qq.QuestionId }).IsUnique();
        });

        // ── QuizAttempt ───────────────────────────────────────────────────────
        modelBuilder.Entity<QuizAttempt>(e =>
        {
            e.ToTable("QuizAttempt");
            e.HasKey(a => a.AttemptId);
            e.Property(a => a.AttemptId).HasColumnName("attempt_id").UseIdentityColumn();
            e.Property(a => a.QuizId).HasColumnName("quiz_id");
            e.Property(a => a.UserId).HasColumnName("user_id");
            e.Property(a => a.GuestIdentifier).HasColumnName("guest_identifier").HasMaxLength(100);
            e.Property(a => a.StartedAt).HasColumnName("started_at").HasColumnType("datetime2").IsRequired();
            e.Property(a => a.SubmittedAt).HasColumnName("submitted_at").HasColumnType("datetime2");
            e.Property(a => a.Score).HasColumnName("score").HasColumnType("decimal(5,2)");
            e.Property(a => a.IsCompleted).HasColumnName("is_completed").IsRequired();
            e.HasOne(a => a.Quiz)
                .WithMany(q => q.Attempts)
                .HasForeignKey(a => a.QuizId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(a => a.User)
                .WithMany(u => u.Attempts)
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.SetNull)
                .IsRequired(false);
        });

        // ── AttemptAnswer ─────────────────────────────────────────────────────
        modelBuilder.Entity<AttemptAnswer>(e =>
        {
            e.ToTable("AttemptAnswer");
            e.HasKey(aa => aa.AttemptAnswerId);
            e.Property(aa => aa.AttemptAnswerId).HasColumnName("attempt_answer_id").UseIdentityColumn();
            e.Property(aa => aa.AttemptId).HasColumnName("attempt_id");
            e.Property(aa => aa.QuestionId).HasColumnName("question_id");
            e.Property(aa => aa.AnswerId).HasColumnName("answer_id");
            e.Property(aa => aa.IsCorrect).HasColumnName("is_correct").IsRequired();
            e.HasOne(aa => aa.Attempt)
                .WithMany(a => a.AttemptAnswers)
                .HasForeignKey(aa => aa.AttemptId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(aa => aa.Question)
                .WithMany(q => q.AttemptAnswers)
                .HasForeignKey(aa => aa.QuestionId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(aa => aa.Answer)
                .WithMany(a => a.AttemptAnswers)
                .HasForeignKey(aa => aa.AnswerId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
