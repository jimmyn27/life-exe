import type { Life } from './saves';

export type PostKind = 'Life update' | 'Hobby' | 'Photo';
export type SocialPost = { age: number; kind: PostKind; text: string; gained: number };
export type SocialPage = { created: boolean; followers: number; posts: SocialPost[] };
export const emptySocial = (): SocialPage => ({ created: false, followers: 0, posts: [] });
export function createSocialPage(life: Life): Life {
  if (life.social?.created) return life;
  return { ...life, social: { created: true, followers: 0, posts: [] }, log: [...life.log, { age: life.age, tag: 'SOCIAL', text: 'I created my social media page.' }] };
}
export function postSocialUpdate(life: Life, kind: PostKind): Life {
  if (!life.social?.created) return life;
  const gained = { 'Life update': 3, Hobby: 5, Photo: 8 }[kind];
  const text = { 'Life update': `A little update from my life at age ${life.age}.`, Hobby: 'Made time for something I enjoy today.', Photo: 'Sharing a favourite moment from my day.' }[kind];
  return { ...life, social: { ...life.social, followers: life.social.followers + gained, posts: [...life.social.posts, { age: life.age, kind, text, gained }] }, log: [...life.log, { age: life.age, tag: 'SOCIAL', text: `I posted ${kind === 'Hobby' ? 'about a hobby' : kind === 'Photo' ? 'a photo' : 'a life update'} and gained ${gained} followers. I now have ${life.social.followers + gained} followers.` }] };
}
