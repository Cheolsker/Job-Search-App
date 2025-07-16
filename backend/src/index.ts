import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Supabase 클라이언트 설정
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

// 미들웨어
app.use(cors());
app.use(express.json());

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ message: 'Job Search API Server' });
});

// 채용공고 검색 API
app.get('/api/jobs', async (req, res) => {
  try {
    const { keyword, location, company } = req.query;
    
    let query = supabase.from('job_posts').select('*');
    
    if (keyword) {
      query = query.ilike('title', `%${keyword}%`);
    }
    
    if (location) {
      query = query.ilike('location', `%${location}%`);
    }
    
    if (company) {
      query = query.ilike('company', `%${company}%`);
    }
    
    const { data, error } = await query.limit(50);
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    res.json({ jobs: data });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 채용공고 상세 조회
app.get('/api/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('job_posts')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json({ job: data });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
