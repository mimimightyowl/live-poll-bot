import request from 'supertest';
import createApp from '../../../app';
import pollService from '../polls.service';
import AppError from '../../../shared/errors/app-error';

// Mock the service
jest.mock('../polls.service');

const app = createApp();

describe('POST /api/polls', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create poll and return 201', async () => {
    const mockPoll = {
      id: 1,
      question: 'Test?',
      created_by: 1,
      created_at: new Date(),
      updated_at: new Date(),
    };

    (pollService.createPoll as jest.Mock).mockResolvedValue(mockPoll);

    const res = await request(app)
      .post('/api/polls')
      .send({ question: 'Test?', created_by: 1 })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.question).toBe('Test?');
    expect(res.body.message).toBe('Poll created successfully');
  });

  it('should return 400 for invalid data', async () => {
    const res = await request(app)
      .post('/api/polls')
      .send({ question: '', created_by: 1 })
      .expect(400);

    expect(res.body.success).toBe(false);
  });

  it('should return 400 for missing required fields', async () => {
    const res = await request(app)
      .post('/api/polls')
      .send({ question: 'Test?' })
      .expect(400);

    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/polls', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return all polls', async () => {
    const mockPolls = [
      {
        id: 1,
        question: 'Question 1?',
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        question: 'Question 2?',
        created_by: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    (pollService.getAllPolls as jest.Mock).mockResolvedValue(mockPolls);

    const res = await request(app).get('/api/polls').expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
  });
});

describe('GET /api/polls/:id', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a poll by id', async () => {
    const mockPoll = {
      id: 1,
      question: 'Test?',
      created_by: 1,
      created_at: new Date(),
      updated_at: new Date(),
    };

    (pollService.getPollById as jest.Mock).mockResolvedValue(mockPoll);

    const res = await request(app).get('/api/polls/1').expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(1);
  });

  it('should return 404 when poll not found', async () => {
    (pollService.getPollById as jest.Mock).mockRejectedValue(
      new AppError('Poll not found', 404)
    );

    const res = await request(app).get('/api/polls/999').expect(404);

    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Poll not found');
  });

  it('should return 400 for invalid id', async () => {
    const res = await request(app).get('/api/polls/invalid').expect(400);

    expect(res.body.success).toBe(false);
  });
});

describe('PUT /api/polls/:id', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update a poll', async () => {
    const mockUpdatedPoll = {
      id: 1,
      question: 'Updated question?',
      created_by: 1,
      created_at: new Date(),
      updated_at: new Date(),
    };

    (pollService.updatePoll as jest.Mock).mockResolvedValue(mockUpdatedPoll);

    const res = await request(app)
      .put('/api/polls/1')
      .send({ question: 'Updated question?' })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.question).toBe('Updated question?');
    expect(res.body.message).toBe('Poll updated successfully');
  });

  it('should return 404 when poll not found', async () => {
    (pollService.updatePoll as jest.Mock).mockRejectedValue(
      new AppError('Poll not found', 404)
    );

    const res = await request(app)
      .put('/api/polls/999')
      .send({ question: 'Updated?' })
      .expect(404);

    expect(res.body.success).toBe(false);
  });
});

describe('DELETE /api/polls/:id', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete a poll', async () => {
    (pollService.deletePoll as jest.Mock).mockResolvedValue(undefined);

    const res = await request(app).delete('/api/polls/1').expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Poll deleted successfully');
  });

  it('should return 404 when poll not found', async () => {
    (pollService.deletePoll as jest.Mock).mockRejectedValue(
      new AppError('Poll not found', 404)
    );

    const res = await request(app).delete('/api/polls/999').expect(404);

    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/polls/:id/results', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return poll results', async () => {
    const mockResults = {
      id: 1,
      question: 'Test?',
      created_by: 1,
      created_at: new Date(),
      updated_at: new Date(),
      options: [
        { id: 1, text: 'Option 1', vote_count: 5 },
        { id: 2, text: 'Option 2', vote_count: 3 },
      ],
      total_votes: 8,
    };

    (pollService.getPollResults as jest.Mock).mockResolvedValue(mockResults);

    const res = await request(app).get('/api/polls/1/results').expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.total_votes).toBe(8);
    expect(res.body.data.options).toHaveLength(2);
  });
});

describe('GET /api/polls/:id/options', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return poll options', async () => {
    const mockOptions = [
      { id: 1, poll_id: 1, text: 'Option 1' },
      { id: 2, poll_id: 1, text: 'Option 2' },
    ];

    (pollService.getPollOptions as jest.Mock).mockResolvedValue(mockOptions);

    const res = await request(app).get('/api/polls/1/options').expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
  });
});

describe('POST /api/polls/:id/options', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should add a poll option', async () => {
    const mockOption = {
      id: 1,
      poll_id: 1,
      text: 'New Option',
    };

    (pollService.addPollOption as jest.Mock).mockResolvedValue(mockOption);

    const res = await request(app)
      .post('/api/polls/1/options')
      .send({ text: 'New Option' })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.text).toBe('New Option');
  });
});

describe('DELETE /api/polls/:pollId/options/:optionId', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete a poll option', async () => {
    (pollService.deletePollOption as jest.Mock).mockResolvedValue(undefined);

    const res = await request(app).delete('/api/polls/1/options/1').expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Option deleted');
  });
});
