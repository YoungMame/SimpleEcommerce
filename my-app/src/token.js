export async function logWithToken() {
    const token = localStorage.getItem("mlb_jwt");
    if (token) {
        console.log("Tentative de se connecter à l'aide du Json Web Token");
        const response = await fetch("/api/user/login", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        if (!response.ok) {
            return (false);
        } else {
            const responseData = await response.json();
            const isAdmin = responseData.admin;
            console.log("Vous avez un token")

            if (isAdmin === true) {
                console.log("Vous etes admin");
                localStorage.setItem("mlb_admin", "true"); 
            }

            return (responseData);
        }
    } else {
        console.log("You do not have a token");
        return (false);
    }
}

// export function setCookieToken(token) {
//     const date = new Date()
//     date.setDate(date.getDate() + 3)
//     document.cookie = `mlb_token = ${token}; expires=${date.toUTCString()}`
// }

// export function getCookieToken() {
//     const cookies = document.cookie.split("; ") 
//     const cookie = cookies.find(c => c.startsWith("mlb_token"))?.split("=")[1]
//     if (cookie === undefined) {
//         return null
//     }
//     return decodeURIComponent(cookie)
// }