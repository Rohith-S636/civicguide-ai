# CivicGuide AI - API Documentation

## Base URL
`http://localhost:8000/api`

## Endpoints

### Chat Endpoints

#### Send Message
```
POST /chat/message
Content-Type: application/json

{
  "message": "How do I register to vote?"
}

Response:
{
  "response": "To register to vote...",
  "sources": [],
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### Get Chat History
```
GET /chat/history?user_id=user123

Response:
{
  "history": [...]
}
```

### Quiz Endpoints

#### Generate Quiz
```
POST /quiz/generate
Content-Type: application/json

{
  "topic": "Voting Process",
  "difficulty": "medium",
  "num_questions": 5
}

Response:
[
  {
    "id": "q1",
    "question": "What is the minimum age to vote?",
    "options": ["18", "21", "25", "16"],
    "correct_answer": "18",
    "explanation": "The minimum voting age in India is 18 years.",
    "difficulty": "easy"
  }
]
```

#### Submit Answer
```
POST /quiz/answer
Content-Type: application/json

{
  "question_id": "q1",
  "selected_answer": "18",
  "user_id": "user123"
}

Response:
{
  "correct": true,
  "explanation": "Correct! The minimum voting age in India is 18 years."
}
```

### News Endpoints

#### Get Latest News
```
GET /news/latest?limit=10

Response:
[
  {
    "title": "Election Commission Announces Schedule",
    "description": "ECI announces schedule for upcoming elections",
    "url": "https://...",
    "source": "ECI Official",
    "published_date": "2024-01-01T00:00:00Z",
    "summary": "..."
  }
]
```

#### Search News
```
GET /news/search?q=voting&limit=10

Response:
[...]
```

### User Endpoints

#### Get Profile
```
GET /users/profile?user_id=user123

Response:
{
  "id": "user123",
  "email": "user@example.com",
  "username": "user_name",
  "xp": 1500,
  "badges": ["quiz_master", "civic_educator"],
  "level": 3,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-15T00:00:00Z"
}
```

#### Update Profile
```
PUT /users/profile?user_id=user123
Content-Type: application/json

{
  "username": "new_username",
  "email": "newemail@example.com"
}

Response:
{...updated profile...}
```

#### Get Leaderboard
```
GET /users/leaderboard?limit=10

Response:
[{...user1...}, {...user2...}]
```

## Error Responses

All endpoints return appropriate HTTP status codes:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error

Error response format:
```json
{
  "detail": "Error message"
}
```
