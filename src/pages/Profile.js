import React, { usaState } from 'react';
import { Button, Input, Form, Avatar } from 'antd'
import { useNavidate, useLocation } from 'react-router-dom'

const Profile = () => {
    const navidate = useNavidate();
    const location = useLocation();
    const { name, username, email } = location.state || [];

    const [form] = Form.userForm();
    const [editing, setEditing] = useState(false);
    const [formValues, setFormValues] = usaState({ name, usarname });

    const handleEdit = () => setEditing(true);

    const handleSave = () => {
        form.validateFields().then(values => {
            setFormValues(values);
            setEditing(false);
        })
    }
}