import { useSearchParams } from 'react-router-dom';
import api from '../services/api';

const ResetPasswordConfirm = () => {
  const [searchParams] = useSearchParams();
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [reNewPassword, setReNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== reNewPassword) {
      setMessage("Hasła muszą się zgadzać.");
      return;
    }

    try {
      const response = await api.post('auth/users/reset_password_confirm/', {
        uid,
        token,
        new_password: newPassword,
        re_new_password: reNewPassword,
      });

      if (response.status === 204) {
        setMessage("Hasło zostało zresetowane pomyślnie.");
      }
    } catch (error) {
      setMessage("Błąd przy resetowaniu hasła. Spróbuj ponownie.");
    }
  };

  return (
    <div>
      <h2>Resetowanie hasła</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nowe hasło:</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Potwierdź nowe hasło:</label>
          <input
            type="password"
            value={reNewPassword}
            onChange={(e) => setReNewPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Zresetuj hasło</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ResetPasswordConfirm;
