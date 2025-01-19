import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';

const ActivateAccount = () => {
  const [searchParams] = useSearchParams();
  const uid = searchParams.get('uid');
  const token = searchParams.get('token');

  const [message, setMessage] = useState('');
  const [activationComplete, setActivationComplete] = useState(false);

  useEffect(() => {
    const activateAccount = async () => {
      if (!uid || !token) {
        setMessage('Nieprawidłowy link aktywacyjny.');
        return;
      }

      try {
        const response = await api.post('/auth/users/activation/', { uid, token });
        setMessage('Konto zostało pomyślnie aktywowane! Możesz teraz się zalogować.');
        setActivationComplete(true);
      } catch (error) {
        setMessage('Nie udało się aktywować konta. Link mógł wygasnąć lub być nieprawidłowy.');
      }
    };

    activateAccount();
  }, [uid, token]);

  return (
    <div>
      <h2>Aktywacja konta</h2>
      <p>{message}</p>
    </div>
  );
};

export default ActivateAccount;
