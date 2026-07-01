const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5001/api/v1'


export const getUiData = async()=>{
    const res = await fetch(`${baseUrl}/ui/all-data`, {cache: "no-cache"})
    return res.json();
}



export const updateUiData = async(id: string, payload: any)=>{
    const res = await fetch(`${baseUrl}/ui/update-ui/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })
    return res.json();
}