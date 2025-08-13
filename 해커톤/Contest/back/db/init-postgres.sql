-- ContestApp PostgreSQL 초기화 스크립트
-- 이 스크립트는 ContestApp의 모든 마이크로서비스에 필요한 PostgreSQL 데이터베이스 스키마를 생성합니다.

-- 사용자 생성 및 권한 부여 (이미 존재하는 경우 무시)
DO
$$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'user') THEN
      CREATE USER "user" WITH PASSWORD 'a1234';
   END IF;
END
$$;

-- 데이터베이스 생성 (이미 존재하는 경우 무시)
-- Docker가 POSTGRES_DB 환경변수로 자동 생성하므로 별도 생성 불필요
\c contestapp;

-- 사용자에게 데이터베이스 권한 부여
GRANT ALL PRIVILEGES ON DATABASE contestapp TO "user";
ALTER DATABASE contestapp OWNER TO "user";

-- 확장 모듈 설치
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 스키마 생성
CREATE SCHEMA IF NOT EXISTS user_service;
CREATE SCHEMA IF NOT EXISTS contest_service;
CREATE SCHEMA IF NOT EXISTS team_service;
CREATE SCHEMA IF NOT EXISTS notification_service;
CREATE SCHEMA IF NOT EXISTS ai_service;

-- 스키마에 대한 권한 부여
GRANT ALL PRIVILEGES ON SCHEMA user_service TO "user";
GRANT ALL PRIVILEGES ON SCHEMA contest_service TO "user";
GRANT ALL PRIVILEGES ON SCHEMA team_service TO "user";
GRANT ALL PRIVILEGES ON SCHEMA notification_service TO "user";
GRANT ALL PRIVILEGES ON SCHEMA ai_service TO "user";

-- 앞으로 생성될 모든 테이블에 대한 권한 설정
ALTER DEFAULT PRIVILEGES IN SCHEMA user_service GRANT ALL PRIVILEGES ON TABLES TO "user";
ALTER DEFAULT PRIVILEGES IN SCHEMA contest_service GRANT ALL PRIVILEGES ON TABLES TO "user";
ALTER DEFAULT PRIVILEGES IN SCHEMA team_service GRANT ALL PRIVILEGES ON TABLES TO "user";
ALTER DEFAULT PRIVILEGES IN SCHEMA notification_service GRANT ALL PRIVILEGES ON TABLES TO "user";
ALTER DEFAULT PRIVILEGES IN SCHEMA ai_service GRANT ALL PRIVILEGES ON TABLES TO "user";

-- =============================================
-- User Service 스키마
-- =============================================

-- 사용자 테이블
CREATE TABLE user_service.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) UNIQUE,
    is_phone_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 프로필 테이블
CREATE TABLE user_service.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_service.users(id) ON DELETE CASCADE,
    full_name VARCHAR(100),
    bio TEXT,
    profile_image_url VARCHAR(255),
    education TEXT,
    experience TEXT,
    portfolio_url VARCHAR(255),
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- NCS 직무 분류 테이블
CREATE TABLE user_service.ncs_categories (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    parent_code VARCHAR(20),
    level INT NOT NULL,
    description TEXT
);

-- 기술 스택 테이블
CREATE TABLE user_service.skills (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50),
    description TEXT
);

-- 사용자-기술 연결 테이블
CREATE TABLE user_service.user_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_service.users(id) ON DELETE CASCADE,
    skill_id INT NOT NULL REFERENCES user_service.skills(id) ON DELETE CASCADE,
    proficiency INT CHECK (proficiency BETWEEN 1 AND 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, skill_id)
);

-- 사용자-NCS 연결 테이블
CREATE TABLE user_service.user_ncs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_service.users(id) ON DELETE CASCADE,
    ncs_category_id INT NOT NULL REFERENCES user_service.ncs_categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, ncs_category_id)
);

-- 파일 메타데이터 테이블
CREATE TABLE user_service.files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_service.users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 팔로우 관계 테이블
CREATE TABLE user_service.follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID NOT NULL REFERENCES user_service.users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES user_service.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- =============================================
-- Contest Service 스키마
-- =============================================

-- 대회/공모전 테이블
CREATE TABLE contest_service.contests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    organizer VARCHAR(100) NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    registration_deadline TIMESTAMP WITH TIME ZONE,
    prize_description TEXT,
    requirements TEXT,
    website_url VARCHAR(255),
    image_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CHECK (end_date > start_date)
);

-- 카테고리 테이블
CREATE TABLE contest_service.categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

-- 대회-카테고리 연결 테이블
CREATE TABLE contest_service.contest_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contest_id UUID NOT NULL REFERENCES contest_service.contests(id) ON DELETE CASCADE,
    category_id INT NOT NULL REFERENCES contest_service.categories(id) ON DELETE CASCADE,
    UNIQUE (contest_id, category_id)
);

-- 즐겨찾기 테이블
CREATE TABLE contest_service.favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    contest_id UUID NOT NULL REFERENCES contest_service.contests(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, contest_id)
);

-- 참가 정보 테이블
CREATE TABLE contest_service.participations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    contest_id UUID NOT NULL REFERENCES contest_service.contests(id) ON DELETE CASCADE,
    team_id UUID,
    status VARCHAR(20) NOT NULL DEFAULT 'REGISTERED', -- REGISTERED, PARTICIPATING, COMPLETED, CANCELLED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, contest_id)
);

-- =============================================
-- Team Service 스키마
-- =============================================

-- 팀 테이블
CREATE TABLE team_service.teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    leader_id UUID NOT NULL,
    contest_id UUID,
    is_recruiting BOOLEAN DEFAULT TRUE,
    is_public BOOLEAN DEFAULT TRUE,
    max_members INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 팀 프로필 테이블
CREATE TABLE team_service.team_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES team_service.teams(id) ON DELETE CASCADE,
    logo_url VARCHAR(255),
    website_url VARCHAR(255),
    github_url VARCHAR(255),
    required_roles TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 팀원 테이블
CREATE TABLE team_service.team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES team_service.teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role VARCHAR(50),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE (team_id, user_id)
);

-- 지원 테이블
CREATE TABLE team_service.applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES team_service.teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    message TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, ACCEPTED, REJECTED, CANCELLED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (team_id, user_id, status)
);

-- 초대 테이블
CREATE TABLE team_service.invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES team_service.teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    message TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, ACCEPTED, REJECTED, EXPIRED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (team_id, user_id, status)
);

-- =============================================
-- Notification Service 스키마
-- =============================================

-- 알림 테이블
CREATE TABLE notification_service.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- TEAM_INVITATION, TEAM_APPLICATION, CONTEST_REMINDER, etc.
    reference_id UUID, -- 관련 엔티티 ID (팀, 대회 등)
    reference_type VARCHAR(50), -- 관련 엔티티 타입 (TEAM, CONTEST, etc.)
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 알림 설정 테이블
CREATE TABLE notification_service.notification_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE,
    email_enabled BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT TRUE,
    team_notifications BOOLEAN DEFAULT TRUE,
    contest_notifications BOOLEAN DEFAULT TRUE,
    system_notifications BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 푸시 알림 구독 테이블
CREATE TABLE notification_service.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    device_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, endpoint)
);

-- =============================================
-- AI Service 스키마
-- =============================================

-- AI 설정 테이블
CREATE TABLE ai_service.ai_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE,
    profiling_completed BOOLEAN DEFAULT FALSE,
    recommendation_frequency VARCHAR(20) DEFAULT 'WEEKLY', -- DAILY, WEEKLY, MONTHLY, NEVER
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 추천 테이블
CREATE TABLE ai_service.recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    entity_id UUID NOT NULL, -- 추천 대상 ID (대회, 팀, 사용자 등)
    entity_type VARCHAR(50) NOT NULL, -- CONTEST, TEAM, USER
    score DECIMAL(5,2) NOT NULL, -- 추천 점수 (0-100)
    reason TEXT,
    is_viewed BOOLEAN DEFAULT FALSE,
    is_clicked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 피드백 테이블
CREATE TABLE ai_service.feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    recommendation_id UUID REFERENCES ai_service.recommendations(id) ON DELETE CASCADE,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 사용자 프로필링 결과 테이블
CREATE TABLE ai_service.user_profiling (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE,
    profiling_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 인덱스 생성
-- =============================================

-- User Service 인덱스
CREATE INDEX idx_users_email ON user_service.users(email);
CREATE INDEX idx_users_username ON user_service.users(username);
CREATE INDEX idx_profiles_user_id ON user_service.profiles(user_id);
CREATE INDEX idx_user_skills_user_id ON user_service.user_skills(user_id);
CREATE INDEX idx_user_skills_skill_id ON user_service.user_skills(skill_id);
CREATE INDEX idx_follows_follower_id ON user_service.follows(follower_id);
CREATE INDEX idx_follows_following_id ON user_service.follows(following_id);

-- Contest Service 인덱스
CREATE INDEX idx_contests_start_date ON contest_service.contests(start_date);
CREATE INDEX idx_contests_end_date ON contest_service.contests(end_date);
CREATE INDEX idx_contest_categories_contest_id ON contest_service.contest_categories(contest_id);
CREATE INDEX idx_contest_categories_category_id ON contest_service.contest_categories(category_id);
CREATE INDEX idx_favorites_user_id ON contest_service.favorites(user_id);
CREATE INDEX idx_favorites_contest_id ON contest_service.favorites(contest_id);
CREATE INDEX idx_participations_user_id ON contest_service.participations(user_id);
CREATE INDEX idx_participations_contest_id ON contest_service.participations(contest_id);

-- Team Service 인덱스
CREATE INDEX idx_teams_leader_id ON team_service.teams(leader_id);
CREATE INDEX idx_teams_contest_id ON team_service.teams(contest_id);
CREATE INDEX idx_teams_is_recruiting ON team_service.teams(is_recruiting);
CREATE INDEX idx_team_members_team_id ON team_service.team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_service.team_members(user_id);
CREATE INDEX idx_applications_team_id ON team_service.applications(team_id);
CREATE INDEX idx_applications_user_id ON team_service.applications(user_id);
CREATE INDEX idx_applications_status ON team_service.applications(status);
CREATE INDEX idx_invitations_team_id ON team_service.invitations(team_id);
CREATE INDEX idx_invitations_user_id ON team_service.invitations(user_id);
CREATE INDEX idx_invitations_status ON team_service.invitations(status);

-- Notification Service 인덱스
CREATE INDEX idx_notifications_user_id ON notification_service.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notification_service.notifications(created_at);
CREATE INDEX idx_notifications_is_read ON notification_service.notifications(is_read);
CREATE INDEX idx_notification_settings_user_id ON notification_service.notification_settings(user_id);
CREATE INDEX idx_push_subscriptions_user_id ON notification_service.push_subscriptions(user_id);

-- AI Service 인덱스
CREATE INDEX idx_ai_settings_user_id ON ai_service.ai_settings(user_id);
CREATE INDEX idx_recommendations_user_id ON ai_service.recommendations(user_id);
CREATE INDEX idx_recommendations_entity_id_type ON ai_service.recommendations(entity_id, entity_type);
CREATE INDEX idx_feedback_user_id ON ai_service.feedback(user_id);
CREATE INDEX idx_feedback_recommendation_id ON ai_service.feedback(recommendation_id);
CREATE INDEX idx_user_profiling_user_id ON ai_service.user_profiling(user_id);

-- =============================================
-- 초기 데이터 삽입
-- =============================================

-- 카테고리 초기 데이터
INSERT INTO contest_service.categories (name, description) VALUES
('IT/프로그래밍', 'IT 및 프로그래밍 관련 대회'),
('디자인', '디자인 관련 대회'),
('마케팅', '마케팅 관련 대회'),
('창업/아이디어', '창업 및 아이디어 관련 대회'),
('과학/공학', '과학 및 공학 관련 대회'),
('예술/문화', '예술 및 문화 관련 대회'),
('사회공헌', '사회공헌 관련 대회'),
('환경', '환경 관련 대회'),
('금융/경제', '금융 및 경제 관련 대회'),
('기타', '기타 분야 대회');

-- 기술 스택 초기 데이터
INSERT INTO user_service.skills (name, category, description) VALUES
('Java', '프로그래밍 언어', 'Java 프로그래밍 언어'),
('Python', '프로그래밍 언어', 'Python 프로그래밍 언어'),
('JavaScript', '프로그래밍 언어', 'JavaScript 프로그래밍 언어'),
('TypeScript', '프로그래밍 언어', 'TypeScript 프로그래밍 언어'),
('C++', '프로그래밍 언어', 'C++ 프로그래밍 언어'),
('C#', '프로그래밍 언어', 'C# 프로그래밍 언어'),
('Go', '프로그래밍 언어', 'Go 프로그래밍 언어'),
('Rust', '프로그래밍 언어', 'Rust 프로그래밍 언어'),
('Swift', '프로그래밍 언어', 'Swift 프로그래밍 언어'),
('Kotlin', '프로그래밍 언어', 'Kotlin 프로그래밍 언어'),
('React', '프론트엔드', 'React 프론트엔드 라이브러리'),
('Angular', '프론트엔드', 'Angular 프론트엔드 프레임워크'),
('Vue.js', '프론트엔드', 'Vue.js 프론트엔드 프레임워크'),
('Next.js', '프론트엔드', 'Next.js 프론트엔드 프레임워크'),
('Spring Boot', '백엔드', 'Spring Boot 백엔드 프레임워크'),
('Django', '백엔드', 'Django 백엔드 프레임워크'),
('Express.js', '백엔드', 'Express.js 백엔드 프레임워크'),
('FastAPI', '백엔드', 'FastAPI 백엔드 프레임워크'),
('Flask', '백엔드', 'Flask 백엔드 프레임워크'),
('Node.js', '백엔드', 'Node.js 백엔드 환경'),
('PostgreSQL', '데이터베이스', 'PostgreSQL 관계형 데이터베이스'),
('MongoDB', '데이터베이스', 'MongoDB NoSQL 데이터베이스'),
('MySQL', '데이터베이스', 'MySQL 관계형 데이터베이스'),
('Redis', '데이터베이스', 'Redis 인메모리 데이터베이스'),
('Docker', '인프라', 'Docker 컨테이너화 도구'),
('Kubernetes', '인프라', 'Kubernetes 컨테이너 오케스트레이션'),
('AWS', '클라우드', 'Amazon Web Services 클라우드 플랫폼'),
('Azure', '클라우드', 'Microsoft Azure 클라우드 플랫폼'),
('GCP', '클라우드', 'Google Cloud Platform 클라우드 플랫폼'),
('TensorFlow', 'AI/ML', 'TensorFlow 머신러닝 프레임워크'),
('PyTorch', 'AI/ML', 'PyTorch 머신러닝 프레임워크'),
('Photoshop', '디자인', 'Adobe Photoshop 디자인 도구'),
('Illustrator', '디자인', 'Adobe Illustrator 디자인 도구'),
('Figma', '디자인', 'Figma 디자인 도구'),
('Sketch', '디자인', 'Sketch 디자인 도구'),
('After Effects', '디자인', 'Adobe After Effects 영상 편집 도구'),
('Premiere Pro', '디자인', 'Adobe Premiere Pro 영상 편집 도구'),
('Unity', '게임 개발', 'Unity 게임 개발 엔진'),
('Unreal Engine', '게임 개발', 'Unreal Engine 게임 개발 엔진'),
('Blender', '3D 모델링', 'Blender 3D 모델링 도구');

-- NCS 직무 분류 초기 데이터 (일부)
INSERT INTO user_service.ncs_categories (code, name, parent_code, level, description) VALUES
('20', '정보통신', NULL, 1, '정보통신 대분류'),
('2001', '정보기술', '20', 2, '정보기술 중분류'),
('200101', '정보기술전략·계획', '2001', 3, '정보기술전략·계획 소분류'),
('200102', '정보기술개발', '2001', 3, '정보기술개발 소분류'),
('200103', '정보기술운영', '2001', 3, '정보기술운영 소분류'),
('200104', '정보기술관리', '2001', 3, '정보기술관리 소분류'),
('200105', '정보기술영업', '2001', 3, '정보기술영업 소분류'),
('20010201', '응용SW엔지니어링', '200102', 4, '응용SW엔지니어링 세분류'),
('20010202', '시스템SW엔지니어링', '200102', 4, '시스템SW엔지니어링 세분류'),
('20010203', '임베디드SW엔지니어링', '200102', 4, '임베디드SW엔지니어링 세분류'),
('20010204', '데이터베이스엔지니어링', '200102', 4, '데이터베이스엔지니어링 세분류'),
('20010205', 'NW엔지니어링', '200102', 4, 'NW엔지니어링 세분류'),
('20010206', '보안엔지니어링', '200102', 4, '보안엔지니어링 세분류'),
('20010207', 'UI/UX엔지니어링', '200102', 4, 'UI/UX엔지니어링 세분류'),
('20010208', '빅데이터엔지니어링', '200102', 4, '빅데이터엔지니어링 세분류'),
('20010209', 'IoT엔지니어링', '200102', 4, 'IoT엔지니어링 세분류'),
('20010210', '클라우드엔지니어링', '200102', 4, '클라우드엔지니어링 세분류'),
('20010211', '인공지능엔지니어링', '200102', 4, '인공지능엔지니어링 세분류');

-- 테스트 사용자 생성
INSERT INTO user_service.users (id, username, email, password, is_active)
VALUES 
(
    '00000000-0000-0000-0000-000000000001',
    'admin',
    'admin@contestapp.com',
    crypt('password123', gen_salt('bf')),
    TRUE
),
(
    '00000000-0000-0000-0000-000000000002',
    'testuser',
    'testuser@contestapp.com',
    crypt('test1234', gen_salt('bf')),
    TRUE
),
(
    '00000000-0000-0000-0000-000000000003',
    'demo',
    'demo@contestapp.com',
    crypt('demo123', gen_salt('bf')),
    TRUE
);

-- 테스트 대회 생성
INSERT INTO contest_service.contests (
    id, title, description, organizer, start_date, end_date, 
    registration_deadline, prize_description, requirements, website_url, is_active
)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    '2024 대학생 AI 경진대회',
    '인공지능 기술을 활용한 혁신적인 솔루션을 개발하는 대회입니다.',
    '한국정보기술협회',
    '2024-03-01 00:00:00+09',
    '2024-05-31 23:59:59+09',
    '2024-02-28 23:59:59+09',
    '대상 1팀 500만원, 최우수상 2팀 300만원, 우수상 3팀 100만원',
    '대학(원)생 누구나 참여 가능, 3-5인으로 팀 구성 필수',
    'https://example.com/ai-contest',
    TRUE
);

-- 대회-카테고리 연결
INSERT INTO contest_service.contest_categories (contest_id, category_id)
VALUES ('00000000-0000-0000-0000-000000000001', 1);

-- =============================================
-- 이미 생성된 모든 테이블에 대한 권한 부여
-- =============================================

-- User Service 스키마의 모든 테이블에 대한 권한 부여
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA user_service TO "user";
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA user_service TO "user";

-- Contest Service 스키마의 모든 테이블에 대한 권한 부여
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA contest_service TO "user";
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA contest_service TO "user";

-- Team Service 스키마의 모든 테이블에 대한 권한 부여
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA team_service TO "user";
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA team_service TO "user";

-- Notification Service 스키마의 모든 테이블에 대한 권한 부여
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA notification_service TO "user";
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA notification_service TO "user";

-- AI Service 스키마의 모든 테이블에 대한 권한 부여
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA ai_service TO "user";
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA ai_service TO "user";
