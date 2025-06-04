import "./agenda.scss";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from 'react-toastify';

export default function Agenda() {
    const { t } = useTranslation();
    const [items, setItems] = useState([]);
    const [limit, setLimit] = useState(15);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const dateOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    };

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const reponse = await fetch(`/api/announce?page=${page}&limit=${limit}&search=${search}`);
                const data = await reponse.json();
                setItems(data.result);
                console.log(JSON.stringify(data))
            } catch (error) {
                toast.error(error);
            }
        }
        fetchItems();
    }, [page, limit, search]);
    return (
        <div className="agenda">
            <h2>{t("agenda.last-announces")}</h2>
            <ul className="announces-list">
                {
                    items.map(item => {
                        let date = new Date(item.date)
                        return (
                        <li className="announces-list__announce">
                            {
                                <img src={item.image || "/no_image.jpg"} alt="" />
                            }
                            <h3 className="announces-list__announce__title">{item.title}</h3>
                            <p className="announces-list__announce__text">{item.text}</p>
                            <p className="announces-list__announce__author">Par {item.author}</p>
                            <div className="announces-list__announce__infos">
                                {
                                    date != "Invalid Date" ? 
                                    <div>
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Zm280 240q-17 0-28.5-11.5T440-440q0-17 11.5-28.5T480-480q17 0 28.5 11.5T520-440q0 17-11.5 28.5T480-400Zm-160 0q-17 0-28.5-11.5T280-440q0-17 11.5-28.5T320-480q17 0 28.5 11.5T360-440q0 17-11.5 28.5T320-400Zm320 0q-17 0-28.5-11.5T600-440q0-17 11.5-28.5T640-480q17 0 28.5 11.5T680-440q0 17-11.5 28.5T640-400ZM480-240q-17 0-28.5-11.5T440-280q0-17 11.5-28.5T480-320q17 0 28.5 11.5T520-280q0 17-11.5 28.5T480-240Zm-160 0q-17 0-28.5-11.5T280-280q0-17 11.5-28.5T320-320q17 0 28.5 11.5T360-280q0 17-11.5 28.5T320-240Zm320 0q-17 0-28.5-11.5T600-280q0-17 11.5-28.5T640-320q17 0 28.5 11.5T680-280q0 17-11.5 28.5T640-240Z"/></svg>
                                        {date.toLocaleString('fr-FR', dateOptions)}
                                    </div>
                                    :
                                    null
                                }
                                {
                                    item.place ? 
                                    <div>
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M480-480q33 0 56.5-23.5T560-560q0-33-23.5-56.5T480-640q-33 0-56.5 23.5T400-560q0 33 23.5 56.5T480-480Zm0 294q122-112 181-203.5T720-552q0-109-69.5-178.5T480-800q-101 0-170.5 69.5T240-552q0 71 59 162.5T480-186Zm0 106Q319-217 239.5-334.5T160-552q0-150 96.5-239T480-880q127 0 223.5 89T800-552q0 100-79.5 217.5T480-80Zm0-480Z"/></svg>                                            
                                        {item.place}
                                    </div>
                                    :
                                    null
                                }
                                {
                                    item.duration ? 
                                    <div>
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m612-292 56-56-148-148v-184h-80v216l172 172ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q133 0 226.5-93.5T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160Z"/></svg>                                            
                                        {item.duration} {t("agenda.hours")}
                                    </div>
                                    :
                                    null
                                }
                            </div>
                        </li>
                        )
                    })
                }
            </ul> 
        </div>
    )
}