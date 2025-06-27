const CORS_ORIGIN_URL = process.env.CORS_ORIGIN_URL || 'http://localhost:3000'

interface Blog {
    name: string;
    date: string;
    content: string;
}

export const getBlogList = async () => {
    const list: Blog[] = await fetch(`${CORS_ORIGIN_URL}/api/blog/list`).then(res => {
        return res.json();
    });
    return list
}

export const getBlogByName = async (name: string) => {
    const blog = await fetch(`${CORS_ORIGIN_URL}/api/blog?name=${name}`).then(res => {
        return res.json();
    })
    return blog
}
