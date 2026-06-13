const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000/api/v1'


export const getUiData = async()=>{
    const res = await fetch(`${baseUrl}/ui/all-data`, {cache: "no-store"})
    return res.json();
}