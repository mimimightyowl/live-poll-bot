import request from 'supertest';
import createApp from '../../../app';
import voteService from '../votes.service';
import AppError from '../../../shared/errors/app-error';

// Mock the service
jest.mock('../votes.service');

const app = createApp();

describe('POST /api/votes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create vote and return 201', async () => {
    const mockVote = {
      id: 1,
      poll_option_id: 1,
      user_id: 1,
      created_at: new Date(),
    };

    (voteService.createVote as jest.Mock).mockResolvedValue(mockVote);

    const res = await request(app)
      .post('/api/votes')
      .send({ poll_option_id: 1, user_id: 1 })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.message).toBe('Vote created successfully');
  });

  it('should return 400 for invalid data', async () => {
    const res = await request(app)
      .post('/api/votes')
      .send({ poll_option_id: -1, user_id: 1 })
      .expect(400);

    expect(res.body.success).toBe(false);
  });

  it('should return 400 for missing required fields', async () => {
    const res = await request(app)
      .post('/api/votes')
      .send({ poll_option_id: 1 })
      .expect(400);

    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/votes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return all votes', async () => {
    const mockVotes = [
      {
        id: 1,
        poll_option_id: 1,
        user_id: 1,
        created_at: new Date(),
      },
      {
        id: 2,
        poll_option_id: 2,
        user_id: 2,
        created_at: new Date(),
      },
    ];

    (voteService.getAllVotes as jest.Mock).mockResolvedValue(mockVotes);

    const res = await request(app).get('/api/votes').expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
  });
});

describe('GET /api/votes/:id', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a vote by id', async () => {
    const mockVote = {
      id: 1,
      poll_option_id: 1,
      user_id: 1,
      created_at: new Date(),
    };

    (voteService.getVoteById as jest.Mock).mockResolvedValue(mockVote);

    const res = await request(app).get('/api/votes/1').expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(1);
  });

  it('should return 404 when vote not found', async () => {
    (voteService.getVoteById as jest.Mock).mockRejectedValue(
      new AppError('Vote not found', 404)
    );

    const res = await request(app).get('/api/votes/999').expect(404);

    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Vote not found');
  });
});

describe('PUT /api/votes/:id', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update a vote', async () => {
    const mockUpdatedVote = {
      id: 1,
      poll_option_id: 2,
      user_id: 1,
      created_at: new Date(),
    };

    (voteService.updateVote as jest.Mock).mockResolvedValue(mockUpdatedVote);

    const res = await request(app)
      .put('/api/votes/1')
      .send({ poll_option_id: 2 })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.poll_option_id).toBe(2);
    expect(res.body.message).toBe('Vote updated successfully');
  });

  it('should return 404 when vote not found', async () => {
    (voteService.updateVote as jest.Mock).mockRejectedValue(
      new AppError('Vote not found', 404)
    );

    const res = await request(app)
      .put('/api/votes/999')
      .send({ poll_option_id: 2 })
      .expect(404);

    expect(res.body.success).toBe(false);
  });
});

describe('DELETE /api/votes/:id', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete a vote', async () => {
    (voteService.deleteVote as jest.Mock).mockResolvedValue(undefined);

    const res = await request(app).delete('/api/votes/1').expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Vote deleted successfully');
  });

  it('should return 404 when vote not found', async () => {
    (voteService.deleteVote as jest.Mock).mockRejectedValue(
      new AppError('Vote not found', 404)
    );

    const res = await request(app).delete('/api/votes/999').expect(404);

    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/votes/check', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return voting status', async () => {
    (voteService.hasUserVotedForPoll as jest.Mock).mockResolvedValue(true);

    const res = await request(app)
      .get('/api/votes/check')
      .query({ user_id: 1, poll_id: 1 })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.hasVoted).toBe(true);
  });

  it('should return false when user has not voted', async () => {
    (voteService.hasUserVotedForPoll as jest.Mock).mockResolvedValue(false);

    const res = await request(app)
      .get('/api/votes/check')
      .query({ user_id: 1, poll_id: 1 })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.hasVoted).toBe(false);
  });

  it('should return 400 for missing query parameters', async () => {
    const res = await request(app).get('/api/votes/check').expect(400);

    expect(res.body.success).toBe(false);
  });
});
