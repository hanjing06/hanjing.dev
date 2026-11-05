import BlogPost from '@/components/BlogPost';
import { postMetadata } from '@/content/posts';

export const metadata = postMetadata('introduction');

const paragraphs = [
  'hello :) my name is hanjing and i’m an engineer. from a very young age, i really wanted a blog. somewhere to express myself in a format that i enjoy which is writing or video.',
  'i started this not because i have anything valuable or astounding to say but i like to document my thoughts in order so when i come back to this time, im able to recall what i was making, thinking or doing at that time.',
  'in my blog you’ll find notes on: engineering, tech, what i’m learning/what i’ve learned, and think pieces.',
  'although i’m not an incredible writer, my main goal with my blog is to inspire. whether that’s creating, thinking, or revisiting a certain interest, if any of this helps you start, then my mission here is complete.',
  'thank you for taking your time to visit, i hope we meet again.',
  'in the mean time, feel free to look around my website.',
];

export default function BlogIntroductionPage() {
  return (
    <BlogPost
      kicker="start here - july 2026"
      title="an introduction."
      cover={{
        src: '/blog/introduction/cover.jpeg',
        alt: 'A nighttime street photo introducing the blog',
      }}
      paragraphs={paragraphs}
    />
  );
}
