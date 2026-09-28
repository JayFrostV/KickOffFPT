using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuizApp.API.Common;
using QuizApp.Application.DTOs;
using QuizApp.Application.Services;

namespace QuizApp.API.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Administrator")]
[Produces("application/json")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;
    public AdminController(IAdminService adminService) => _adminService = adminService;

    // ── UC18 Manage Users ─────────────────────────────────────────────────────
    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _adminService.GetAllUsersAsync();
        return Ok(ApiResponse<IEnumerable<UserDto>>.Ok(users));
    }

    [HttpPut("users/{id:int}/status")]
    public async Task<IActionResult> SetStatus(int id, [FromBody] UpdateUserStatusRequest request)
    {
        var (dto, error) = await _adminService.SetUserStatusAsync(id, request.IsActive);
        if (error is not null) return NotFound(ApiResponse.Fail(error));
        return Ok(ApiResponse<UserDto>.Ok(dto!, $"User {(request.IsActive ? "activated" : "deactivated")}."));
    }

    // ── UC19/UC20 Manage & Moderate Quizzes ──────────────────────────────────
    [HttpGet("quizzes")]
    public async Task<IActionResult> GetAllQuizzes()
    {
        var quizzes = await _adminService.GetAllQuizzesAsync();
        return Ok(ApiResponse<IEnumerable<QuizDto>>.Ok(quizzes));
    }

    [HttpDelete("quizzes/{id:int}")]
    public async Task<IActionResult> RemoveQuiz(int id)
    {
        var (success, error) = await _adminService.RemoveQuizAsync(id);
        if (!success) return NotFound(ApiResponse.Fail(error!));
        return Ok(ApiResponse.Ok("Quiz removed from the system."));
    }
}
