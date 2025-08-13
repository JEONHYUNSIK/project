package com.contestapp.aiService.service;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProfilingService  {

   private static final List<String> QUESTIONS = List.of(
        "관심 기술 스택은 무엇인가요?",
        "팀 프로젝트 경험이 있나요?",
        "선호하는 활동은 어떤 것인가요?",
        "선호하는 대회 주제는 무엇인가요?"
    );

    public List<String> getQuestions() {
        return QUESTIONS;
    }

} 