
// Used for confirming actions
const ConfirmForm = ({ onConfirm, onClose, text }) => {

    const handleConfirm = () => {
        onConfirm();
        onClose();
    }

    return (
        <div className="overlay">
            <div className="modal">
                <h3>{text}</h3>
                <div>
                    <button className="mainBut" onClick={handleConfirm}>Tak</button>
                    <button className="mainBut" onClick={onClose}>Nie</button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmForm;