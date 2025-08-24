import React from "react";
import styled from "styled-components";
import Sidebar from "../../components/Sidebar";
import GreetingNote from "../../components/GreetingNote";
import EmployeeForm from "../../components/EmployeeForm";
import { addEmployee } from "../../services/Employee/addEmployee";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const AddEmployee = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = async (formData) => {
    try {
      await addEmployee(formData);
      navigate("/employee");
    } catch (error) {
      console.error("Error adding employee:", error);
    }
  };

  const handleCancel = () => {
    navigate("/employee");
  };

  return (
    <Container>
      <Sidebar user={user} />
      <Main>
        <GreetingNote userName={user?.name} />
        <EmployeeForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          title="Add New Employee"
          submitButtonText="Add Employee"
          siteId={user ? user.siteId : null}
          createdBy={user ? user.id : null}
        />
      </Main>
    </Container>
  );
};

export default AddEmployee;

const Container = styled.div`
  display: flex;
  flex-direction: row;
  height: 100vh;
`;

const Main = styled.div`
  display: flex;
  flex: 1;
  background-color: #f8f9fa;
  padding: 20px;
  flex-direction: column;
`;
