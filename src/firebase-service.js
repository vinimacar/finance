import { db } from './firebase-config.js';
import { collection, addDoc, getDocs, query, orderBy } from "firebase/firestore";

const COLLECTION_NAME = 'transactions';

export const addTransactionToFirebase = async (transaction) => {
    try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), transaction);
        console.log("Document written with ID: ", docRef.id);
        return { ...transaction, id: docRef.id };
    } catch (e) {
        console.error("Error adding document: ", e);
        throw e;
    }
};

export const getTransactionsFromFirebase = async () => {
    try {
        const q = query(collection(db, COLLECTION_NAME), orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);
        const transactions = [];
        querySnapshot.forEach((doc) => {
            transactions.push({ id: doc.id, ...doc.data() });
        });
        return transactions;
    } catch (e) {
        console.error("Error getting documents: ", e);
        return [];
    }
};
