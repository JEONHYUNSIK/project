package com.contestapp.aiService.service;


import com.contestapp.aiService.dto.ProfilingAnswerRequest;

import com.contestapp.aiService.entity.UserProfiling;

import com.contestapp.aiService.repository.UserProfilingRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;


import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserProfilingService {

    private final UserProfilingRepository userProfilingRepository;
    
    public ResponseEntity<String> submitAnswer(@PathVariable UUID id, @RequestBody ProfilingAnswerRequest answer) {
    UserProfiling profiling = userProfilingRepository.findByUserId(id)
        .orElseGet(() -> new UserProfiling(id, new HashMap<>()));

    // JSONB 필드 업데이트 (Map<String, String>)
    Map<String, String> data = profiling.getProfilingData();
    data.put(answer.getQuestion(), answer.getAnswer());
    profiling.setProfilingData(data);
    profiling.setUpdatedAt(OffsetDateTime.now());

    userProfilingRepository.save(profiling);
    return ResponseEntity.ok("Answer submitted successfully.");
    }

} 