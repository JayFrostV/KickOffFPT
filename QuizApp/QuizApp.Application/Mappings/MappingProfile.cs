using AutoMapper;
using QuizApp.Application.DTOs;
using QuizApp.Domain.Entities;

namespace QuizApp.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // User
        CreateMap<User, UserDto>()
            .ForMember(d => d.Role, o => o.MapFrom(s => s.Role.ToString()));

        // QuestionBank
        CreateMap<QuestionBank, QuestionBankDto>()
            .ForMember(d => d.Visibility, o => o.MapFrom(s => s.Visibility.ToString()))
            .ForMember(d => d.QuestionCount, o => o.MapFrom(s => s.Questions.Count));

        CreateMap<QuestionBank, QuestionBankDetailDto>()
            .ForMember(d => d.Visibility, o => o.MapFrom(s => s.Visibility.ToString()));

        // Question
        CreateMap<Question, QuestionDto>()
            .ForMember(d => d.QuestionType, o => o.MapFrom(s => s.QuestionType.ToString()));

        CreateMap<Question, PublicQuestionDto>()
            .ForMember(d => d.QuestionType, o => o.MapFrom(s => s.QuestionType.ToString()));

        // Answer
        CreateMap<Answer, AnswerDto>();
        CreateMap<Answer, PublicAnswerDto>();

        // Quiz
        CreateMap<Quiz, QuizDto>()
            .ForMember(d => d.CreatorName, o => o.MapFrom(s => s.Creator.Username))
            .ForMember(d => d.Visibility, o => o.MapFrom(s => s.Visibility.ToString()))
            .ForMember(d => d.QuestionCount, o => o.MapFrom(s => s.QuizQuestions.Count));

        CreateMap<Quiz, QuizDetailDto>()
            .ForMember(d => d.CreatorName, o => o.MapFrom(s => s.Creator.Username))
            .ForMember(d => d.Visibility, o => o.MapFrom(s => s.Visibility.ToString()))
            .ForMember(d => d.Questions, o => o.MapFrom(s => s.QuizQuestions)); // Maps to QuizQuestionDto

        CreateMap<Quiz, PublicQuizDetailDto>()
            .ForMember(d => d.Questions, o => o.MapFrom(s => s.QuizQuestions.Select(qq => qq.Question))); // Plucks Question out

        // QuizQuestion
        CreateMap<QuizQuestion, QuizQuestionDto>();

        // Attempt
        CreateMap<QuizAttempt, AttemptDto>()
            .ForMember(d => d.QuizTitle, o => o.MapFrom(s => s.Quiz.Title));

        // AttemptAnswer
        CreateMap<AttemptAnswer, AttemptAnswerResultDto>()
            .ForMember(d => d.QuestionContent, o => o.MapFrom(s => s.Question.Content))
            .ForMember(d => d.AnswerContent, o => o.MapFrom(s => s.Answer.Content));
    }
}
