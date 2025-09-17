import axios from 'axios'

export interface PinterestUser {
  id: string
  username: string
  first_name: string
  last_name: string
  bio: string
  created_at: string
  image: {
    '60x60': {
      url: string
      width: number
      height: number
    }
  }
  counts: {
    followers: number
    following: number
    pins: number
    boards: number
  }
}

export interface PinterestBoard {
  id: string
  name: string
  description: string
  privacy: 'PUBLIC' | 'SECRET'
  created_at: string
  board_owner: {
    username: string
  }
  media: {
    '150x150': {
      url: string
      width: number
      height: number
    }
  }
  pin_count: number
  follower_count: number
  url: string
}

export interface CreatePinRequest {
  board_id: string
  title: string
  description: string
  link?: string
  media_source: {
    source_type: 'image_url'
    url: string
  }
}

export interface PinterestPin {
  id: string
  created_at: string
  link: string
  title: string
  description: string
  media: {
    '150x150': {
      url: string
      width: number
      height: number
    }
    '400x300': {
      url: string
      width: number
      height: number
    }
    '600x': {
      url: string
      width: number
      height: number
    }
    '1200x': {
      url: string
      width: number
      height: number
    }
  }
  board_id: string
  board_name: string
  board_owner: {
    username: string
  }
  pinner: {
    username: string
  }
}

export class PinterestAPI {
  private accessToken: string
  private baseURL = 'https://api.pinterest.com/v5'

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    }
  }

  async getUser(): Promise<PinterestUser> {
    const response = await axios.get(`${this.baseURL}/user_account`, {
      headers: this.getHeaders(),
    })
    return response.data
  }

  async getBoards(): Promise<PinterestBoard[]> {
    const response = await axios.get(`${this.baseURL}/boards`, {
      headers: this.getHeaders(),
      params: {
        page_size: 25,
      },
    })
    return response.data.items || []
  }

  async getBoard(boardId: string): Promise<PinterestBoard> {
    const response = await axios.get(`${this.baseURL}/boards/${boardId}`, {
      headers: this.getHeaders(),
    })
    return response.data
  }

  async createPin(pinData: CreatePinRequest): Promise<PinterestPin> {
    const response = await axios.post(`${this.baseURL}/pins`, pinData, {
      headers: this.getHeaders(),
    })
    return response.data
  }

  async getPins(boardId?: string, pageSize = 25): Promise<PinterestPin[]> {
    const params: any = { page_size: pageSize }
    if (boardId) {
      params.board_id = boardId
    }

    const response = await axios.get(`${this.baseURL}/pins`, {
      headers: this.getHeaders(),
      params,
    })
    return response.data.items || []
  }

  async refreshAccessToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string; expires_in: number }> {
    const response = await axios.post('https://api.pinterest.com/v5/oauth/token', {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: process.env.PINTEREST_CLIENT_ID,
      client_secret: process.env.PINTEREST_CLIENT_SECRET,
    })
    return response.data
  }
}
