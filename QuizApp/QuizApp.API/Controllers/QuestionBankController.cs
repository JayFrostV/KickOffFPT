using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuizApp.API.Common;
using QuizApp.Application.DTOs;
using QuizApp.Application.Services;
using System.Security.Claims;

namespace QuizApp.API.Controllers;

[ApiController]
[Route("api/question-banks")]
[Authorize]
[Produces("application/json")]
public class QuestionBankController : ControllerBase
{
    private readonly IQuestionBankService _bankService;
    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    public QuestionBankController(IQuestionBankService bankService) => _bankService = bankService;

    // ── UC15 My Question Banks ────────────────────────────────────────────────
    [HttpGet("mine")]
    public async Task<IActionResult> GetMine()
    {
        var banks = await _bankService.GetMyBanksAsync(UserId);
        return Ok(ApiResponse<IEnumerable<QuestionBankDto>>.Ok(banks));
    }

    // ── UC16 Browse Public Banks ──────────────────────────────────────────────
    [HttpGet("public")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPublic()
    {
        var banks = await _bankService.GetPublicBanksAsync();
        return Ok(ApiResponse<IEnumerable<QuestionBankDto>>.Ok(banks));
    }

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetDetail(int id)
    {
        var userId = User.Identity?.IsAuthenticated == true ? UserId : (int?)null;
        var bank = await _bankService.GetDetailAsync(id, userId);
        if (bank is null) return NotFound(ApiResponse.Fail("Question bank not found or not accessible."));
        return Ok(ApiResponse<QuestionBankDetailDto>.Ok(bank));
    }

    // ── UC15 Create Bank ──────────────────────────────────────────────────────
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateQuestionBankRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name)) return BadRequest(ApiResponse.Fail("Name is required."));
        var bank = await _bankService.CreateAsync(UserId, request);
        return StatusCode(201, ApiResponse<QuestionBankDto>.Ok(bank, "Question bank created."));
    }

    // ── UC15 Update Bank ──────────────────────────────────────────────────────
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateQuestionBankRequest request)
    {
        var (dto, error) = await _bankService.UpdateAsync(id, UserId, request);
        if (error is not null) return error.Contains("own") ? Forbid() : NotFound(ApiResponse.Fail(error));
        return Ok(ApiResponse<QuestionBankDto>.Ok(dto!));
    }

    // ── UC15 Delete Bank ──────────────────────────────────────────────────────
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var (success, error) = await _bankService.DeleteAsync(id, UserId);
        if (!success) return error!.Contains("own") ? Forbid() : NotFound(ApiResponse.Fail(error!));
        return Ok(ApiResponse.Ok("Question bank deleted."));
    }

    // ── UC15 Add Question to Bank ─────────────────────────────────────────────
    [HttpPost("{bankId:int}/questions")]
    public async Task<IActionResult> AddQuestion(int bankId, [FromBody] CreateQuestionRequest request)
    {
        var (dto, error) = await _bankService.AddQuestionAsync(bankId, UserId, request);
        if (error is not null) return error.Contains("own") ? Forbid() : BadRequest(ApiResponse.Fail(error));
        return StatusCode(201, ApiResponse<QuestionDto>.Ok(dto!));
    }

    // ── UC15 Update Question ──────────────────────────────────────────────────
    [HttpPut("questions/{questionId:int}")]
    public async Task<IActionResult> UpdateQuestion(int questionId, [FromBody] UpdateQuestionRequest request)
    {
        var (dto, error) = await _bankService.UpdateQuestionAsync(questionId, UserId, request);
        if (error is not null) return error.Contains("own") ? Forbid() : NotFound(ApiResponse.Fail(error));
        return Ok(ApiResponse<QuestionDto>.Ok(dto!));
    }

    // ── UC15 Delete Question ──────────────────────────────────────────────────
    [HttpDelete("questions/{questionId:int}")]
    public async Task<IActionResult> DeleteQuestion(int questionId)
    {
        var (success, error) = await _bankService.DeleteQuestionAsync(questionId, UserId);
        if (!success) return error!.Contains("own") ? Forbid() : NotFound(ApiResponse.Fail(error!));
        return Ok(ApiResponse.Ok("Question deleted."));
    }

    // ── UC15 Add Answer ───────────────────────────────────────────────────────
    [HttpPost("questions/{questionId:int}/answers")]
    public async Task<IActionResult> AddAnswer(int questionId, [FromBody] CreateAnswerRequest request)
    {
        var (dto, error) = await _bankService.AddAnswerAsync(questionId, UserId, request);
        if (error is not null) return error.Contains("own") ? Forbid() : BadRequest(ApiResponse.Fail(error));
        return StatusCode(201, ApiResponse<AnswerDto>.Ok(dto!));
    }

    // ── UC15 Update Answer ────────────────────────────────────────────────────
    [HttpPut("answers/{answerId:int}")]
    public async Task<IActionResult> UpdateAnswer(int answerId, [FromBody] UpdateAnswerRequest request)
    {
        var (dto, error) = await _bankService.UpdateAnswerAsync(answerId, UserId, request);
        if (error is not null) return error.Contains("own") ? Forbid() : NotFound(ApiResponse.Fail(error));
        return Ok(ApiResponse<AnswerDto>.Ok(dto!));
    }

    // ── UC15 Delete Answer ────────────────────────────────────────────────────
    [HttpDelete("answers/{answerId:int}")]
    public async Task<IActionResult> DeleteAnswer(int answerId)
    {
        var (success, error) = await _bankService.DeleteAnswerAsync(answerId, UserId);
        if (!success) return error!.Contains("own") ? Forbid() : NotFound(ApiResponse.Fail(error!));
        return Ok(ApiResponse.Ok("Answer deleted."));
    }

    // ── UC16 Search Public Questions ──────────────────────────────────────────
    [HttpGet("public/questions")]
    [AllowAnonymous]
    public async Task<IActionResult> SearchPublicQuestions([FromQuery] string? keyword)
    {
        var questions = await _bankService.SearchPublicQuestionsAsync(keyword);
        return Ok(ApiResponse<IEnumerable<QuestionDto>>.Ok(questions));
    }
}
