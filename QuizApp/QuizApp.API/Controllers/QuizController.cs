using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuizApp.API.Common;
using QuizApp.Application.DTOs;
using QuizApp.Application.Services;
using System.Security.Claims;

namespace QuizApp.API.Controllers;

[ApiController]
[Route("api/quizzes")]
[Produces("application/json")]
public class QuizController : ControllerBase
{
    private readonly IQuizService _quizService;
    private readonly IAttemptService _attemptService;

    public QuizController(IQuizService quizService, IAttemptService attemptService)
    {
        _quizService = quizService;
        _attemptService = attemptService;
    }

    private int? GetUserId() =>
        User.Identity?.IsAuthenticated == true
            ? int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!)
            : null;

    // ── UC04/UC05 Browse & Search Public Quizzes (Guest + User) ──────────────
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetPublic([FromQuery] string? keyword)
    {
        var quizzes = await _quizService.GetPublicAsync(keyword);
        return Ok(ApiResponse<IEnumerable<QuizDto>>.Ok(quizzes));
    }

    // ── UC06 View Quiz Details ────────────────────────────────────────────────
    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetDetail(int id)
    {
        var quiz = await _quizService.GetDetailAsync(id, GetUserId());
        if (quiz is null) return NotFound(ApiResponse.Fail("Quiz not found or not accessible."));
        return Ok(ApiResponse<QuizDetailDto>.Ok(quiz));
    }

    // ── UC07/UC08 Take Quiz (Guest trial or authenticated user) ───────────────
    [HttpPost("{id:int}/start")]
    [AllowAnonymous]
    public async Task<IActionResult> StartAttempt(int id, [FromBody] StartAttemptRequest request)
    {
        var userId = GetUserId();
        var (dto, error) = await _attemptService.StartAsync(id, userId, request.GuestIdentifier);
        if (error is not null)
        {
            if (error.Contains("Trial limit")) return StatusCode(403, ApiResponse.Fail(error));
            return NotFound(ApiResponse.Fail(error));
        }
        return Ok(ApiResponse<AttemptDto>.Ok(dto!, "Quiz started."));
    }

    // ── UC08 Get quiz questions for taking (no IsCorrect) ────────────────────
    [HttpGet("{id:int}/take")]
    [AllowAnonymous]
    public async Task<IActionResult> TakeQuiz(int id)
    {
        var quiz = await _quizService.GetForTakingAsync(id);
        if (quiz is null) return NotFound(ApiResponse.Fail("Quiz not found or not available."));
        return Ok(ApiResponse<PublicQuizDetailDto>.Ok(quiz));
    }

    // ── UC09 Submit Quiz ──────────────────────────────────────────────────────
    [HttpPost("attempts/{attemptId:int}/submit")]
    [AllowAnonymous]
    public async Task<IActionResult> Submit(int attemptId, [FromBody] SubmitAttemptRequest request, [FromQuery] string? guestIdentifier)
    {
        var userId = GetUserId();
        var (result, error) = await _attemptService.SubmitAsync(attemptId, userId, guestIdentifier, request);
        if (error is not null)
        {
            if (error == "Forbidden.") return Forbid();
            if (error.Contains("not found")) return NotFound(ApiResponse.Fail(error));
            return UnprocessableEntity(ApiResponse.Fail(error));
        }
        return Ok(ApiResponse<AttemptResultDto>.Ok(result!, "Quiz submitted successfully."));
    }

    // ── UC10 View Result ──────────────────────────────────────────────────────
    [HttpGet("attempts/{attemptId:int}/result")]
    [AllowAnonymous]
    public async Task<IActionResult> GetResult(int attemptId)
    {
        var result = await _attemptService.GetResultAsync(attemptId, GetUserId());
        if (result is null) return NotFound(ApiResponse.Fail("Result not found or not accessible."));
        return Ok(ApiResponse<AttemptResultDto>.Ok(result));
    }

    // ── My Attempts History ───────────────────────────────────────────────────
    [HttpGet("my-attempts")]
    [Authorize]
    public async Task<IActionResult> GetMyAttempts()
    {
        var attempts = await _attemptService.GetMyAttemptsAsync(GetUserId()!.Value);
        return Ok(ApiResponse<IEnumerable<AttemptDto>>.Ok(attempts));
    }

    // ── UC11 Create Quiz (User only) ──────────────────────────────────────────
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreateQuizRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Title)) return BadRequest(ApiResponse.Fail("Title is required."));
        var quiz = await _quizService.CreateAsync(GetUserId()!.Value, request);
        return StatusCode(201, ApiResponse<QuizDto>.Ok(quiz, "Quiz created successfully."));
    }

    // ── UC12 My Quizzes ───────────────────────────────────────────────────────
    [HttpGet("mine")]
    [Authorize]
    public async Task<IActionResult> GetMine()
    {
        var quizzes = await _quizService.GetMyQuizzesAsync(GetUserId()!.Value);
        return Ok(ApiResponse<IEnumerable<QuizDto>>.Ok(quizzes));
    }

    // ── UC12 Update Quiz ──────────────────────────────────────────────────────
    [HttpPut("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateQuizRequest request)
    {
        var (dto, error) = await _quizService.UpdateAsync(id, GetUserId()!.Value, request);
        if (error is not null) return error.Contains("own") ? Forbid() : NotFound(ApiResponse.Fail(error));
        return Ok(ApiResponse<QuizDto>.Ok(dto!));
    }

    // ── UC12 Delete Quiz ──────────────────────────────────────────────────────
    [HttpDelete("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var (success, error) = await _quizService.DeleteAsync(id, GetUserId()!.Value);
        if (!success) return error!.Contains("own") ? Forbid() : NotFound(ApiResponse.Fail(error!));
        return Ok(ApiResponse.Ok("Quiz deleted successfully."));
    }

    // ── UC14 Publish Quiz ─────────────────────────────────────────────────────
    [HttpPost("{id:int}/publish")]
    [Authorize]
    public async Task<IActionResult> Publish(int id)
    {
        var (dto, error) = await _quizService.PublishAsync(id, GetUserId()!.Value);
        if (error is not null) return error.Contains("own") ? Forbid() : BadRequest(ApiResponse.Fail(error));
        return Ok(ApiResponse<QuizDto>.Ok(dto!, "Quiz is now public."));
    }

    // ── UC14 Unpublish Quiz ───────────────────────────────────────────────────
    [HttpPost("{id:int}/unpublish")]
    [Authorize]
    public async Task<IActionResult> Unpublish(int id)
    {
        var (dto, error) = await _quizService.UnpublishAsync(id, GetUserId()!.Value);
        if (error is not null) return error.Contains("own") ? Forbid() : BadRequest(ApiResponse.Fail(error));
        return Ok(ApiResponse<QuizDto>.Ok(dto!, "Quiz is now private."));
    }

    // ── UC13 Add Question to Quiz ─────────────────────────────────────────────
    [HttpPost("{id:int}/questions")]
    [Authorize]
    public async Task<IActionResult> AddQuestion(int id, [FromBody] AddQuestionToQuizRequest request)
    {
        var (dto, error) = await _quizService.AddQuestionAsync(id, GetUserId()!.Value, request);
        if (error is not null) return error.Contains("own") ? Forbid() : BadRequest(ApiResponse.Fail(error));
        return Ok(ApiResponse<QuizDetailDto>.Ok(dto!));
    }

    // ── UC13 Remove Question from Quiz ────────────────────────────────────────
    [HttpDelete("quiz-questions/{quizQuestionId:int}")]
    [Authorize]
    public async Task<IActionResult> RemoveQuestion(int quizQuestionId)
    {
        var (success, error) = await _quizService.RemoveQuestionAsync(quizQuestionId, GetUserId()!.Value);
        if (!success) return error!.Contains("own") ? Forbid() : NotFound(ApiResponse.Fail(error!));
        return Ok(ApiResponse.Ok("Question removed from quiz."));
    }
}
