// ContestApp MongoDB 초기화 스크립트
// 이 스크립트는 ContestApp의 채팅 서비스와 AI 서비스에 필요한 MongoDB 컬렉션을 생성합니다.

// 데이터베이스 생성
db = db.getSiblingDB('contestapp');

// 애플리케이션용 사용자 생성
db.createUser({
  user: "user",
  pwd: "a1234",
  roles: [
    { role: "readWrite", db: "contestapp" }
  ]
});

// 채팅 서비스 컬렉션 생성
db.createCollection('chat_rooms');
db.createCollection('chat_messages');
db.createCollection('chat_participants');

// AI 서비스 컬렉션 생성
db.createCollection('ai_chat_sessions');
db.createCollection('ai_chat_messages');
db.createCollection('profiling_sessions');

// 인덱스 생성
// 채팅 서비스 인덱스
db.chat_rooms.createIndex({ "created_at": 1 });
db.chat_rooms.createIndex({ "participants": 1 });
db.chat_rooms.createIndex({ "team_id": 1 });
db.chat_rooms.createIndex({ "type": 1 });

db.chat_messages.createIndex({ "room_id": 1, "created_at": 1 });
db.chat_messages.createIndex({ "sender_id": 1 });
db.chat_messages.createIndex({ "created_at": 1 });

db.chat_participants.createIndex({ "room_id": 1 });
db.chat_participants.createIndex({ "user_id": 1 });
db.chat_participants.createIndex({ "last_read_at": 1 });

// AI 서비스 인덱스
db.ai_chat_sessions.createIndex({ "user_id": 1 });
db.ai_chat_sessions.createIndex({ "created_at": 1 });
db.ai_chat_sessions.createIndex({ "session_type": 1 });

db.ai_chat_messages.createIndex({ "session_id": 1, "created_at": 1 });
db.ai_chat_messages.createIndex({ "role": 1 });

db.profiling_sessions.createIndex({ "user_id": 1 });
db.profiling_sessions.createIndex({ "created_at": 1 });
db.profiling_sessions.createIndex({ "completed": 1 });

// 컬렉션 스키마 정의 (MongoDB 4.2 이상에서 지원)
db.runCommand({
  collMod: "chat_rooms",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["type", "created_at"],
      properties: {
        type: {
          bsonType: "string",
          enum: ["DIRECT", "TEAM"],
          description: "채팅방 유형 (1:1 또는 팀)"
        },
        team_id: {
          bsonType: ["string", "null"],
          description: "팀 채팅방인 경우 팀 ID"
        },
        name: {
          bsonType: "string",
          description: "채팅방 이름"
        },
        participants: {
          bsonType: "array",
          description: "참여자 ID 목록"
        },
        created_at: {
          bsonType: "date",
          description: "생성 시간"
        },
        updated_at: {
          bsonType: "date",
          description: "마지막 메시지 시간"
        }
      }
    }
  }
});

db.runCommand({
  collMod: "chat_messages",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["room_id", "sender_id", "content", "created_at"],
      properties: {
        room_id: {
          bsonType: "string",
          description: "채팅방 ID"
        },
        sender_id: {
          bsonType: "string",
          description: "발신자 ID"
        },
        content: {
          bsonType: "string",
          description: "메시지 내용"
        },
        content_type: {
          bsonType: "string",
          enum: ["TEXT", "IMAGE", "FILE", "SYSTEM"],
          description: "메시지 유형"
        },
        file_url: {
          bsonType: ["string", "null"],
          description: "파일 URL (파일인 경우)"
        },
        created_at: {
          bsonType: "date",
          description: "생성 시간"
        }
      }
    }
  }
});

db.runCommand({
  collMod: "chat_participants",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["room_id", "user_id", "joined_at"],
      properties: {
        room_id: {
          bsonType: "string",
          description: "채팅방 ID"
        },
        user_id: {
          bsonType: "string",
          description: "사용자 ID"
        },
        nickname: {
          bsonType: "string",
          description: "채팅방 내 닉네임"
        },
        last_read_at: {
          bsonType: "date",
          description: "마지막으로 읽은 시간"
        },
        joined_at: {
          bsonType: "date",
          description: "참여 시간"
        },
        left_at: {
          bsonType: ["date", "null"],
          description: "퇴장 시간"
        },
        is_active: {
          bsonType: "bool",
          description: "활성 상태 여부"
        }
      }
    }
  }
});

db.runCommand({
  collMod: "ai_chat_sessions",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["user_id", "session_type", "created_at"],
      properties: {
        user_id: {
          bsonType: "string",
          description: "사용자 ID"
        },
        session_type: {
          bsonType: "string",
          enum: ["PROFILING", "RECOMMENDATION", "GENERAL"],
          description: "세션 유형"
        },
        title: {
          bsonType: "string",
          description: "세션 제목"
        },
        context: {
          bsonType: "object",
          description: "세션 컨텍스트 정보"
        },
        created_at: {
          bsonType: "date",
          description: "생성 시간"
        },
        updated_at: {
          bsonType: "date",
          description: "마지막 메시지 시간"
        },
        completed: {
          bsonType: "bool",
          description: "완료 여부"
        }
      }
    }
  }
});

db.runCommand({
  collMod: "ai_chat_messages",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["session_id", "role", "content", "created_at"],
      properties: {
        session_id: {
          bsonType: "string",
          description: "세션 ID"
        },
        role: {
          bsonType: "string",
          enum: ["USER", "ASSISTANT", "SYSTEM"],
          description: "메시지 역할"
        },
        content: {
          bsonType: "string",
          description: "메시지 내용"
        },
        created_at: {
          bsonType: "date",
          description: "생성 시간"
        },
        metadata: {
          bsonType: "object",
          description: "추가 메타데이터"
        }
      }
    }
  }
});

db.runCommand({
  collMod: "profiling_sessions",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["user_id", "created_at"],
      properties: {
        user_id: {
          bsonType: "string",
          description: "사용자 ID"
        },
        questions: {
          bsonType: "array",
          description: "질문 목록"
        },
        answers: {
          bsonType: "array",
          description: "답변 목록"
        },
        current_step: {
          bsonType: "int",
          description: "현재 단계"
        },
        total_steps: {
          bsonType: "int",
          description: "전체 단계"
        },
        created_at: {
          bsonType: "date",
          description: "생성 시간"
        },
        updated_at: {
          bsonType: "date",
          description: "마지막 업데이트 시간"
        },
        completed: {
          bsonType: "bool",
          description: "완료 여부"
        },
        result: {
          bsonType: "object",
          description: "프로파일링 결과"
        }
      }
    }
  }
});

// 샘플 데이터 삽입
// 테스트용 채팅방 생성
const testRoomId = ObjectId();
db.chat_rooms.insertOne({
  _id: testRoomId,
  type: "DIRECT",
  name: "테스트 채팅방",
  participants: ["00000000-0000-0000-0000-000000000001", "00000000-0000-0000-0000-000000000002"],
  created_at: new Date(),
  updated_at: new Date()
});

// 테스트용 채팅 메시지 생성
db.chat_messages.insertOne({
  room_id: testRoomId.toString(),
  sender_id: "00000000-0000-0000-0000-000000000001",
  content: "안녕하세요! 테스트 메시지입니다.",
  content_type: "TEXT",
  created_at: new Date()
});

// 테스트용 채팅 참여자 생성
db.chat_participants.insertMany([
  {
    room_id: testRoomId.toString(),
    user_id: "00000000-0000-0000-0000-000000000001",
    nickname: "관리자",
    last_read_at: new Date(),
    joined_at: new Date(),
    is_active: true
  },
  {
    room_id: testRoomId.toString(),
    user_id: "00000000-0000-0000-0000-000000000002",
    nickname: "테스트 사용자",
    last_read_at: new Date(),
    joined_at: new Date(),
    is_active: true
  }
]);

// 테스트용 AI 챗봇 세션 생성
const testSessionId = ObjectId();
db.ai_chat_sessions.insertOne({
  _id: testSessionId,
  user_id: "00000000-0000-0000-0000-000000000001",
  session_type: "GENERAL",
  title: "테스트 AI 챗봇 세션",
  context: { purpose: "testing" },
  created_at: new Date(),
  updated_at: new Date(),
  completed: false
});

// 테스트용 AI 챗봇 메시지 생성
db.ai_chat_messages.insertMany([
  {
    session_id: testSessionId.toString(),
    role: "USER",
    content: "안녕하세요, AI 챗봇!",
    created_at: new Date()
  },
  {
    session_id: testSessionId.toString(),
    role: "ASSISTANT",
    content: "안녕하세요! 무엇을 도와드릴까요?",
    created_at: new Date()
  }
]);

print("MongoDB 초기화가 완료되었습니다.");