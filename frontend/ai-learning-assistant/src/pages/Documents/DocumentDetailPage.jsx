// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import documentService from "../../services/documentService";
// import toast from "react-hot-toast";

// export default function DocumentDetailPage() {
//   const { id } = useParams();
//   const [document, setDocument] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState("Content");

//   useEffect(() => {
//     const fetchDocumentDetails = async () => {
//       try {
//         const data = await documentService.getDocumentById(id);
//         setDocument(data);
//       } catch (error) {
//         toast.error("Failed to fetch document details.");
//         console.error(error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDocumentDetails();
//   }, [id]);
//   return <div>hello</div>;
// }
