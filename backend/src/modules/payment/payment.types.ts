export interface ResponseWith3DS {
  status: '3DS_required';
  Method: string;
  URL: string;
  PaReq: string;
  MD: string;
  callback_url: string;
}

export interface ResponseWithout3DS {
  status: 'executed' | 'pending' | 'error' | 'authorized';
}
