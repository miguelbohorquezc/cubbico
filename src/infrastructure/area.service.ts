import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import { db } from "./firebase/firebase";
import { AreaIhsInfo } from "../domain/entities/area";


export const addArea = async (area: AreaIhsInfo) => {
    try {
        let docRef;
        let action = 'actualizado';

        if (area.id) {
            // Actualizar documento existente
            docRef = doc(db, "areas", area.id);
            await setDoc(docRef, {
                asignatura: area.asignatura,
                ihs: area.ihs,
                area: area.area,
                orden: area.orden,
                nivel: area.nivel
            }, { merge: true });
        } else {
            // Crear nuevo documento con ID automático
            const newDocRef = await addDoc(collection(db, "areas"), {
                asignatura: area.asignatura,
                ihs: area.ihs,
                area: area.area,
                orden: area.orden,
                nivel: area.nivel
            });
            docRef = newDocRef;
            action = 'registrado';
        }

        alert(`El área: ${area.area} ${area.asignatura} se ha ${action} correctamente`);
    } catch (error) {
        console.error('Error al agregar/editar el área:', error);
        alert('Hubo un error al procesar el área. Por favor, intenta nuevamente.');
    }
};



