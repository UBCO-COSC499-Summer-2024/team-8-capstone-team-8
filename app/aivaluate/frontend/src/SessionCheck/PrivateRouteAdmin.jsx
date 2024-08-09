import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';

const PrivateRouteAdmin = ({ element: Component }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const params = useParams();

    useEffect(() => {
        axios.get('http://localhost:5173/admin-api/dashboard', { withCredentials: true })
            .then(response => {
                if (response.status === 200) {
                    setIsAuthenticated(true);
                }
            })
            .catch(() => {
                setIsAuthenticated(false);
            });
    }, []);

    if (isAuthenticated === null) {
        return <div>Loading...</div>;
    }

    return isAuthenticated ? <Component {...params}/> : <Navigate to="/admin/login" />;
};

export default PrivateRouteAdmin;
