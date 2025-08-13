package com.contestapp.aiService.controller;

import com.contestapp.aiService.dto.ProfilingAnswerRequest;

import com.contestapp.aiService.service.AiSettingService;
import com.contestapp.aiService.service.ProfilingService;
import com.contestapp.aiService.service.UserProfilingService;

import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/ai/profiling")
@RequiredArgsConstructor
public class AiProfilingController {

    private final AiSettingService aiSettingService;
    private final ProfilingService profilingService;
    private final UserProfilingService userProfilingService;



 /** 프로파일링 시작 */
    @PostMapping("/start")
    public ResponseEntity<String> startProfiling(@RequestBody UUID userId) {
        //System.out.println("================================================================ Starting profiling for user: " + userId +"================================================================");
        return aiSettingService.startProfiling(userId);
    }

    /** 프로파일링 질문 조회 */
    @GetMapping("/sessions/{id}/questions")
    public ResponseEntity<List<String>> getQuestions(@PathVariable UUID id) {
        return ResponseEntity.ok(profilingService.getQuestions());

    }

    /** 프로파일링 질문에 대한 답변 */
    @PostMapping("/sessions/{id}/answer")
    public ResponseEntity<String> submitAnswer(@PathVariable UUID id, @RequestBody ProfilingAnswerRequest answer) {


        return userProfilingService.submitAnswer(id, answer);


    }

    // /** 프로파일링 완료 */
    // @PostMapping("/sessions/{id}/complete")
    // public ResponseEntity<AiSettingsResponse> profilingComplete(@PathVariable UUID id) {
    //     AiSettingsResponse response = aiSettingService.completeProfiling(id);
    //     return ResponseEntity.ok(response);
    // }

    // /** 프로파일링 질문 넘기기 */
    // @PostMapping("/sessions/{id}/skip")
    // public ResponseEntity<AiSettingsResponse> profilingSkip(@PathVariable UUID id) {
    //     AiSettingsResponse response = aiSettingService.skipProfiling(id);
    //     return ResponseEntity.ok(response);
    // }  
} 