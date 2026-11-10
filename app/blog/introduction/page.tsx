import BlogPost from '@/components/BlogPost';
import { getPost, postMetadata } from '@/content/posts';

export const metadata = postMetadata('introduction');

const post = getPost('introduction');

export default function BlogIntroductionPage() {
  return (
    <BlogPost
      kicker={post.kicker}
      title={post.title}
      cover={{
        src: '/blog/introduction/cover.jpeg',
        alt: 'A nighttime street photo introducing the blog',
      }}
      paragraphs={post.body}
    />
  );
}
