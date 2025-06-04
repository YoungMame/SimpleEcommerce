const OrderModel = require("../models/order");

// const depositDate = new Date().toISOString().split('T')[0]; 
// const labelRequestData = {
//     outputFormat: {
//         x: '0',
//         y: '0',
//         outputPrintingType: 'PDF_A4_300dpi'
//     },
//     letter: {
//         service: {
//             productCode: 'COL',
//             depositDate: depositDate
//         },
//         parcel: {
//             weight: '1.2'
//         },
//         sender: {
//             address: {
//                 companyName: 'ReceiverCompanyName',
//                 line2: "347 rue de 4 ages", // Assurez-vous que cela est renseigné
//                 zipCode: '27340',
//                 city: "Criquebeuf-sur-Seine",
//                 countryCode: 'FR'
//             }
//         },
//         addressee: {
//             address: {
//                 lastName: req.body.lastName || "", // Assurez-vous que ces valeurs sont fournies
//                 firstName: req.body.firstName || "",
//                 line0: req.body.line0 || "", // Optionnel, si vous avez un nom de société
//                 line1: req.body.line1 || "", // Doit contenir le numéro et la rue
//                 line2: req.body.line2 || "", // Optionnel
//                 line3: req.body.line3 || "", // Optionnel
//                 countryCode: req.body.country || "",
//                 city: req.body.city || "",
//                 zipCode: req.body.zipCode || "",
//                 phoneNumber: req.body.phone || "",
//                 doorCode1: req.body.doorCode1 || "",
//                 doorCode2: req.body.doorCode2 || "",
//                 intercom: req.body.intercom || "",
//                 email: req.body.email || "",
//             }
//         }                
//     }
// };

// // Appel à l'API Colissimo avec node-fetch
// const response = await fetch('https://ws.colissimo.fr/sls-ws/SlsServiceWSRest/2.0/generateLabel', {
//     method: 'POST',
//     headers: {
//         'Content-Type': 'application/json',
//         'apiKey': process.env.COLISSIMO_API_KEY
//     },
//     body: JSON.stringify(labelRequestData)
// });

// if (!response.ok) {
//     console.log( `Erreur de l'API Colissimo: ${response.status}`);
// }

// console.log(response)
// // const data = await response.json();
// // console.log(data)