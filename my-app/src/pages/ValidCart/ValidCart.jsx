import "./validcart.scss";
import { useState, useContext, createContext, useEffect } from "react";
import { toast } from 'react-toastify';
import { useTranslation } from "react-i18next";
import countries from "../../data/countries.json";
import {loadStripe} from '@stripe/stripe-js';
import { PaymentElement, Elements, useStripe, useElements } from '@stripe/react-stripe-js';
const CartContext = createContext();

function Address() {
    const { addressData, setAddressData, setCurrentCart, setStage } = useContext(CartContext);
    const { t } = useTranslation();
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setAddressData({ ...addressData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("mlb_jwt");
		const response = await fetch("/api/payment/total-price", {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
			},
            body: JSON.stringify({ address: addressData })
		});
        console.log(response);
		if(!response.ok)
        {
            const responseText = await response.text();
            return toast.error(t("valid-cart."+responseText));
        }
		const responseData = await response.json();
        setCurrentCart(responseData);
        setStage(2);

    };

    return (
        <>
            <form className="adress-form" onSubmit={handleSubmit}>
                <h2>{t("valid-cart.adress-form")}</h2>
                <label>
                    {t("valid-cart.firstname")}:
                    <input type="text" name="firstName" value={addressData.firstName} onChange={handleChange} required />
                </label>
                <label>
                    {t("valid-cart.lastname")}:
                    <input type="text" name="lastName" value={addressData.lastName} onChange={handleChange} required />
                </label>
                <label>
                    {t("valid-cart.email")}:
                    <input type="text" name="email" value={addressData.email} onChange={handleChange} required />
                </label>
                <label>
                    {t("valid-cart.phone")}:
                    <input type="text" name="phone" value={addressData.phone} onChange={handleChange} required />
                </label>
                <label>
                    {t("valid-cart.line0")}:
                    <input type="text" name="line0" value={addressData.line0} onChange={handleChange} required />
                </label>
                <label>
                    {t("valid-cart.line1")}:
                    <input type="text" name="line1" value={addressData.line1} onChange={handleChange} required />
                </label>
                <label>
                    {t("valid-cart.line2")}:
                    <input type="text" name="line2" value={addressData.line2} onChange={handleChange} required />
                </label>
                <label>
                    {t("valid-cart.line3")}:
                    <input type="text" name="line3" value={addressData.line3} onChange={handleChange} required />
                </label>
                <label>
                    {t("valid-cart.postal-code")}:
                    <input type="text" name="zipCode" value={addressData.zipCode} onChange={handleChange} placeholder={
                        addressData.country 
                        ? countries[Object.keys(countries).find(key => countries[key].country_code === addressData.country)]?.structure
                        : ""
                    } required />
                </label>
                <label>
                    {t("valid-cart.city")}:
                    <input type="text" name="city" value={addressData.city} onChange={handleChange} required />
                </label>
                <label>
                    {t("valid-cart.country")}:
                    <select name="country" value={addressData.country} onChange={handleChange} required>
                        {
                            Object.values(countries).map((countryData, index) => {
                                return (
                                    <option key={index} value={countryData.country_code}>
                                        {t(countryData.text)}
                                    </option>
                                );
                            })
                        }
                    </select>
                </label> 
                <label>
                    {t("valid-cart.door-code")}:
                    <input type="text" name="doorCode1" value={addressData.doorCode1} onChange={handleChange} required />
                </label>
                <label>
                    {t("valid-cart.door-code2")}:
                    <input type="text" name="doorCode2" value={addressData.doorCode2} onChange={handleChange} required />
                </label>
                <label>
                    {t("valid-cart.intercom")}:
                    <input type="text" name="intercom" value={addressData.intercom} onChange={handleChange} required />
                </label>
                <button className="ok" onClick={handleSubmit} type="submit">{t("valid-cart.submit-adress")}</button>
            </form>
        </>
    )
};

function CheckoutForm() {
    const { t } = useTranslation();
    const stripe = useStripe();
    const elements = useElements();
    const { addressData, currentCart } = useContext(CartContext);
    const [errorMessage, setErrorMessage] = useState(null);

    const sendOrder = async (e) => {
        e.preventDefault();
        if (elements == null) {
            return;
        }
    
        const { error: submitError } = await elements.submit();
    
        if (submitError) {
            setErrorMessage(submitError.message);
            return;
        }
    
        const token = localStorage.getItem("mlb_jwt");
    
        // Fixing the fetch call: add await and correct method for sending request
        const response = await fetch("/api/payment/payment-intent", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ address: addressData }),
        });
    
        // Check if the response is OK before proceeding
        if (!response.ok) {
            const errorText = await response.text();
            toast.error(`Error: ${errorText}`);
            return;
        }
    
        const responseData = await response.json();
        const { clientSecret } = responseData;
    
        // Handle stripe payment
        const { error } = await stripe.confirmPayment({
            elements,
            clientSecret,
            confirmParams: {
                return_url: `${window.location.origin}/cart-validated`,
            },
        });
    
        if (error) {
            setErrorMessage(error.message || error);
        }
    };

    return <form className="checkout-form" onSubmit={sendOrder}>
        <PaymentElement />
        <button type="submit" disabled={!stripe || !elements}>{t("valid-cart.pay")}</button>
        {errorMessage && <p>{errorMessage}</p>}
    </form>
}

function Pay() {
    const { t } = useTranslation();
    const stripePromise = loadStripe('pk_test_51Q2vlXI6xBbFUtQv4CZTQEEY3r1ZCOFHYXEd3Z0RS96q1KwLWC0S10zYG1nJscfLFRnCxfBAsH50s7x5fmfpf4xo000Folwkex');
    const { addressData, currentCart } = useContext(CartContext);

    const options = {
        mode: 'payment',
        capture_method: "manual",
        amount: currentCart.totalPrice*100,
        currency: 'eur'
        // appearance: {
        //     /*...*/
        // },
    };
    const vatRate = process.env.VAT;
    const vat = (currentCart.totalPrice * vatRate) / (100 + vatRate);

    return (
            <div className="basket__container">
                <div className="basket__infos">
                    <div className="basket__infos__price">
                        <p><span>{t("valid-cart.under-total")}</span>{`: ${currentCart.productsPrice}€`}</p>
                        <p><span>{t("valid-cart.shipping-price")}</span>{`: ${currentCart.deliveryPrice}€`}</p>
                        <p><span>{t("valid-cart.vat")}</span>{`: ${vat.toFixed(2)}€ (20%)`}</p> {/* Affichage de la TVA */}
                        <p className="basket__infos__price__total">{`${t("valid-cart.total-price")} : ${currentCart.totalPrice}€ TTC`}</p>
                    </div>
                    <div className="basket__infos__products">
                        {currentCart.cart.map(product => {
                            return <div className="basket__infos__products__product">
                                <p className="basket__infos__products__product__title">{product.title}</p>
                                <p className="basket__infos__products__product__ref">{product.productCode}</p>
                                <p className="basket__infos__products__product__quantity">{`x${product.quantity}`}</p>
                            </div>
                        })}
                    </div>
                    <div className="basket__infos__adress">
                        <div className="basket__infos__adress__product">
                            <p className="basket__infos__adress__name">{`${currentCart.address.firstName} ${currentCart.address.lastName}`}</p>
                            <p className="basket__infos__adress__line">{currentCart.address.line0}</p>
                            <p className="basket__infos__adress__line">{currentCart.address.line1}</p>
                            <p className="basket__infos__adress__line">{currentCart.address.line2}</p>
                            <p className="basket__infos__adress__line">{currentCart.address.line3}</p>
                            <p className="basket__infos__adress__city">{`${currentCart.address.zipCode} ${currentCart.address.city}`}</p>
                            <p className="basket__infos__adress__country">{currentCart.address.country}</p>
                            <p className="basket__infos__adress__contact">{currentCart.address.phone}</p>
                            <p className="basket__infos__adress__contact">{currentCart.address.email}</p>
                            <p className="basket__infos__adress__contact">{currentCart.address.doorCode1}</p>
                            <p className="basket__infos__adress__contact">{currentCart.address.doorCode2}</p>
                            <p className="basket__infos__adress__contact">{currentCart.address.intercom}</p>
                        </div>
                    </div>
                </div>
                <Elements stripe={stripePromise} options={options}>
                    <CheckoutForm/>
                </Elements>
            </div>
    )
};

const CartContextProvider = ({ children }) => {
    const { t } = useTranslation();

    const [addressData, setAddressData] = useState({
        firstName: "",
        lastName: "",
        line0: "",
        line1: "",
        line2: "",     
        line3: "",
        city: "",
        country: "",
        zipCode: "",
        intercom: "",
        doorCode1: "",
        doorCode2: "",
        phone: "",  
        email: ""
    });
    const [currentCart, setCurrentCart] = useState({
        cart: [],
        totalPrice: 0,
        deliveryPrice: 0,
        productsPrice: 0
    });
    const [cart, setCart] = useState(null);

    const [stage, setStage] = useState(1);

    const fetchActiveCart = async () => {
        const token = localStorage.getItem("mlb_jwt");
        const response = await fetch("/api/user/cart", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            return toast.error(t(`account.cart.${errorText}`));
        }

        const cart = await response.json();
        setCart(cart);
    };

    useEffect(() => {
        fetchActiveCart();
    }, []);

    return (
        <CartContext.Provider value={{ addressData, setAddressData, stage, setStage, cart, currentCart, setCurrentCart }}>
            <h1>{t("valid-cart.title")}</h1>
            {children}
        </CartContext.Provider>
    );
};


function ValidCartContent() {
    const { stage } = useContext(CartContext);
    let content;
    
    switch (stage) {
        case 2:
            content = <Pay/>;
        break;
        default:
            content = <Address/>;
        break;
    }
    return content;
}

export default function ValidCart() {
    return (
        <>
            <CartContextProvider>
                <ValidCartContent/>
            </CartContextProvider>
        </>
    );
};

// line0 : Cela peut être utilisé pour le nom de la société ou le nom de l'expéditeur/destinataire. C'est souvent le champ le plus élevé dans une adresse.
// line1 : Souvent utilisé pour la première ligne de l'adresse, comme le numéro de rue et le nom de la rue.
// line2 : Peut contenir des informations supplémentaires, comme un complément d'adresse (ex. : "Appartement 5", "Bâtiment B").
// line3 : Généralement utilisée pour des informations supplémentaires si l'adresse est longue ou si des précisions sont nécessaires.