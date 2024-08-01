export enum UserVerifyStatus {
  Unverified,
  Verified,
  Banned
}

export enum TypeToken {
  AccessToken,
  RefreshToken,
  ResetPasswordToken,
  EmailVerifyToken
}

export enum MediaType {
  Image,
  Video,
  HLS
}

export enum VideoEncodingStatus {
  Pending,
  Processing,
  Success,
  Failed
}

export enum TweetType {
  Tweet,
  Retweet,
  Comment,
  QuoteTweet
}

export enum TweetAudience {
  Everyone,
  TweetCircle
}

export enum ReqMediaType {
  Image,
  Video
}

export enum OfEnum {
  All,
  OnlyFollower
}
