-- Contest Service 테스트 데이터 삽입
-- 이 스크립트를 PostgreSQL 쿼리 툴에서 실행하세요

-- 기존 테스트 데이터 삭제 (필요한 경우)
DELETE FROM contest_service.contest_categories;
DELETE FROM contest_service.contests WHERE title LIKE '%테스트%' OR title LIKE '%2024%';

-- 테스트 대회 데이터 삽입
INSERT INTO contest_service.contests (
    id, title, description, organizer, start_date, end_date, 
    registration_deadline, prize_description, requirements, website_url, image_url, is_active
) VALUES 
-- 1. AI/ML 대회
(
    '10000000-0000-0000-0000-000000000001',
    '2024 AI 챌린지 - 미래를 예측하라',
    '인공지능 기술을 활용하여 실생활 문제를 해결하는 혁신적인 솔루션을 개발하는 대회입니다. 데이터 분석, 머신러닝, 딥러닝 등 다양한 AI 기술을 활용할 수 있습니다.',
    '한국인공지능협회',
    '2024-03-01 09:00:00+09',
    '2024-05-31 18:00:00+09',
    '2024-02-28 23:59:59+09',
    '대상 1팀: 1,000만원, 최우수상 2팀: 500만원, 우수상 3팀: 200만원, 입선 10팀: 50만원',
    '대학생/대학원생, 일반인 모두 참여 가능. 팀당 3-5명으로 구성',
    'https://example.com/ai-challenge-2024',
    'https://example.com/images/ai-challenge.jpg',
    TRUE
),
-- 2. 웹 개발 대회
(
    '10000000-0000-0000-0000-000000000002',
    '풀스택 웹 개발 경진대회',
    'React, Vue.js, Angular 등의 프론트엔드 기술과 Node.js, Spring Boot, Django 등의 백엔드 기술을 활용한 웹 애플리케이션 개발 대회입니다.',
    '웹개발자협회',
    '2024-04-15 09:00:00+09',
    '2024-06-30 18:00:00+09',
    '2024-04-10 23:59:59+09',
    '대상: 500만원, 우수상: 300만원, 장려상: 100만원',
    '개발 경험 1년 이상, 개인 또는 2-3인 팀',
    'https://example.com/web-dev-contest',
    'https://example.com/images/web-dev.jpg',
    TRUE
),
-- 3. 모바일 앱 개발 대회
(
    '10000000-0000-0000-0000-000000000003',
    '모바일 앱 개발 해커톤 2024',
    'Android, iOS 네이티브 앱 또는 React Native, Flutter 등 크로스플랫폼 기술을 활용한 모바일 앱 개발 48시간 해커톤입니다.',
    '모바일개발자모임',
    '2024-05-18 09:00:00+09',
    '2024-05-20 18:00:00+09',
    '2024-05-15 23:59:59+09',
    '1등: 300만원, 2등: 200만원, 3등: 100만원, 특별상: 50만원',
    '모바일 개발 경험자, 팀당 2-4명',
    'https://example.com/mobile-hackathon',
    'https://example.com/images/mobile-hackathon.jpg',
    TRUE
),
-- 4. 디자인 대회
(
    '10000000-0000-0000-0000-000000000004',
    'UI/UX 디자인 어워드 2024',
    '혁신적이고 사용자 친화적인 UI/UX 디자인을 통해 디지털 경험을 개선하는 디자인 대회입니다. 웹, 모바일, 데스크톱 등 다양한 플랫폼 대상.',
    '한국디자이너협회',
    '2024-06-01 09:00:00+09',
    '2024-08-15 18:00:00+09',
    '2024-05-25 23:59:59+09',
    '대상: 200만원, 금상: 100만원, 은상: 50만원, 동상: 30만원',
    '디자인 전공자 또는 관련 경력자, 개인 참가',
    'https://example.com/design-award',
    'https://example.com/images/design-award.jpg',
    TRUE
),
-- 5. 창업 아이디어 대회
(
    '10000000-0000-0000-0000-000000000005',
    '2024 창업 아이디어 경진대회',
    '혁신적인 비즈니스 아이디어로 사회 문제를 해결하고 새로운 가치를 창출하는 창업 아이디어 공모전입니다. 기술 기반 스타트업 아이디어 환영.',
    '창업진흥원',
    '2024-07-01 09:00:00+09',
    '2024-09-30 18:00:00+09',
    '2024-06-25 23:59:59+09',
    '대상: 1,500만원 + 창업 지원, 우수상: 1,000만원, 장려상: 500만원',
    '대학생, 일반인, 예비창업자, 팀당 1-5명',
    'https://example.com/startup-idea',
    'https://example.com/images/startup-idea.jpg',
    TRUE
),
-- 6. 게임 개발 대회
(
    '10000000-0000-0000-0000-000000000006',
    '인디 게임 개발 챌린지',
    'Unity, Unreal Engine 등을 활용한 인디 게임 개발 대회입니다. 창의적인 게임플레이와 독창적인 스토리텔링을 보여주세요.',
    '게임개발자협회',
    '2024-08-01 09:00:00+09',
    '2024-10-31 18:00:00+09',
    '2024-07-25 23:59:59+09',
    '대상: 800만원, 우수상: 400만원, 창의상: 200만원',
    '게임 개발 경험자, 팀당 2-6명',
    'https://example.com/game-challenge',
    'https://example.com/images/game-challenge.jpg',
    TRUE
),
-- 7. 데이터 사이언스 대회
(
    '10000000-0000-0000-0000-000000000007',
    '빅데이터 분석 경진대회 2024',
    '실제 기업 데이터를 활용한 데이터 분석 및 인사이트 도출 대회입니다. Python, R, SQL 등 다양한 분석 도구 활용 가능.',
    '데이터사이언스협회',
    '2024-09-01 09:00:00+09',
    '2024-11-30 18:00:00+09',
    '2024-08-25 23:59:59+09',
    '대상: 600만원, 우수상: 300만원, 장려상: 150만원',
    '데이터 분석 경험자, 대학생/일반인, 팀당 2-4명',
    'https://example.com/data-challenge',
    'https://example.com/images/data-challenge.jpg',
    TRUE
),
-- 8. 블록체인 대회
(
    '10000000-0000-0000-0000-000000000008',
    '블록체인 혁신 해커톤',
    'DeFi, NFT, Web3 등 블록체인 기술을 활용한 혁신적인 서비스 개발 해커톤입니다. Ethereum, Polygon, Solana 등 다양한 체인 지원.',
    '블록체인협회',
    '2024-10-15 09:00:00+09',
    '2024-10-17 18:00:00+09',
    '2024-10-10 23:59:59+09',
    '1등: 1,000만원, 2등: 500만원, 3등: 300만원, 기업상: 100만원',
    '블록체인 개발 경험자, 팀당 3-5명',
    'https://example.com/blockchain-hackathon',
    'https://example.com/images/blockchain-hackathon.jpg',
    TRUE
),
-- 9. IoT 대회  
(
    '10000000-0000-0000-0000-000000000009',
    'IoT 스마트시티 솔루션 대회',
    '사물인터넷 기술을 활용하여 스마트시티 구현을 위한 혁신적인 IoT 솔루션을 개발하는 대회입니다.',
    'IoT산업협회',
    '2024-11-01 09:00:00+09',
    '2024-12-31 18:00:00+09',
    '2024-10-25 23:59:59+09',
    '대상: 700만원, 우수상: 400만원, 장려상: 200만원',
    '전자/컴퓨터 관련 전공자, 팀당 3-4명',
    'https://example.com/iot-contest',
    'https://example.com/images/iot-contest.jpg',
    TRUE
),
-- 10. 사회공헌 아이디어 대회
(
    '10000000-0000-0000-0000-000000000010',
    '2024 소셜 임팩트 챌린지',
    '기술을 활용하여 사회적 문제를 해결하고 긍정적인 변화를 만드는 소셜 임팩트 솔루션 개발 대회입니다.',
    '사회공헌재단',
    '2024-12-01 09:00:00+09',
    '2025-02-28 18:00:00+09',
    '2024-11-25 23:59:59+09',
    '대상: 1,200만원 + 사업화 지원, 우수상: 600만원, 장려상: 300만원',
    '대학생, 일반인, 사회적기업 등, 팀당 2-5명',
    'https://example.com/social-impact',
    'https://example.com/images/social-impact.jpg',
    TRUE
);

-- 대회-카테고리 연결 (Many-to-Many 관계)
INSERT INTO contest_service.contest_categories (contest_id, category_id) VALUES 
-- AI 챌린지 -> IT/프로그래밍
('10000000-0000-0000-0000-000000000001', 1),
-- 웹 개발 -> IT/프로그래밍  
('10000000-0000-0000-0000-000000000002', 1),
-- 모바일 앱 개발 -> IT/프로그래밍
('10000000-0000-0000-0000-000000000003', 1),
-- UI/UX 디자인 -> 디자인
('10000000-0000-0000-0000-000000000004', 2),
-- 창업 아이디어 -> 창업/아이디어
('10000000-0000-0000-0000-000000000005', 4),
-- 게임 개발 -> IT/프로그래밍
('10000000-0000-0000-0000-000000000006', 1),
-- 데이터 사이언스 -> IT/프로그래밍
('10000000-0000-0000-0000-000000000007', 1),
-- 블록체인 -> IT/프로그래밍
('10000000-0000-0000-0000-000000000008', 1),
-- IoT -> 과학/공학
('10000000-0000-0000-0000-000000000009', 5),
-- 소셜 임팩트 -> 사회공헌
('10000000-0000-0000-0000-000000000010', 7);

-- 일부 대회에 추가 카테고리 연결 (다중 카테고리)
INSERT INTO contest_service.contest_categories (contest_id, category_id) VALUES 
-- 창업 아이디어 -> IT/프로그래밍 (기술 기반 창업)
('10000000-0000-0000-0000-000000000005', 1),
-- IoT -> IT/프로그래밍 (기술 기반)
('10000000-0000-0000-0000-000000000009', 1),
-- 소셜 임팩트 -> IT/프로그래밍 (기술 활용)
('10000000-0000-0000-0000-000000000010', 1);

-- 데이터 확인 쿼리
SELECT 
    c.id,
    c.title,
    c.organizer,
    c.start_date,
    c.end_date,
    c.registration_deadline,
    c.is_active,
    STRING_AGG(cat.name, ', ') as categories
FROM contest_service.contests c
LEFT JOIN contest_service.contest_categories cc ON c.id = cc.contest_id  
LEFT JOIN contest_service.categories cat ON cc.category_id = cat.id
WHERE c.title LIKE '%2024%' OR c.title LIKE '%챌린지%' OR c.title LIKE '%해커톤%'
GROUP BY c.id, c.title, c.organizer, c.start_date, c.end_date, c.registration_deadline, c.is_active
ORDER BY c.created_at DESC; 