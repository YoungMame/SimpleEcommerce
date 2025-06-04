import "./cartvalidated.scss";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

export default function CartValidated() {
    const { t } = useTranslation();
    const deleteUserCart = async () => {
        try {
            const token = localStorage.getItem("mlb_jwt");
            await fetch("/api/user/delete-cart", {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`, 
                }
            })
            return ;            
        } catch (error) {
            console.log(error.message || error)
        }
		
	};
    useEffect(() => {
        deleteUserCart();
    }, [])
    return <div className="cart-validated">
        <h1>{t("cart-validated.your-cart-was-validated")}</h1>
        <span>{t("cart-validated.your-cart-was-validated-text")}</span>
        <p>{t("cart-validated.thank-you")}</p>
    </div>
};