import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import styled from "styled-components";
import {
  MDBBadge,
  MDBBtn,
  MDBTable,
  MDBTableHead,
  MDBTableBody,
  MDBIcon,
} from "mdb-react-ui-kit";
import { getEmployees } from "../../services/Employee/getEmployees";
import { updateEmployee } from "../../services/Employee/updateEmployee";
import GreetingNote from "../../components/GreetingNote";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import EmployeeForm from "../../components/EmployeeForm";
import defaultPhoto from "../../assets/user.png";
const Employee = () => {
  const [employees, setEmployees] = useState([]);
  const { user } = useAuth();
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    try {
      const fetchEmployees = async () => {
        const employees = await getEmployees({
          role: user.role,
          siteId: user.siteId,
        });
        setEmployees(employees.users);
      };
      fetchEmployees();
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  }, []);

  // // Function to format employee name properly
  // const formatEmployeeName = (employee) => {
  //   const firstName = employee.firstName || "";
  //   const lastName = employee.lastName || "";

  //   if (firstName && lastName) {
  //     return `${firstName} ${lastName}`;
  //   } else if (firstName) {
  //     return firstName;
  //   } else if (lastName) {
  //     return lastName;
  //   } else {
  //     return "No Name";
  //   }
  // };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setShowEditForm(true);
  };

  const handleEditSubmit = async (formData) => {
    try {
      await updateEmployee(editingEmployee.id, formData);

      // Show success message
      setUpdateMessage("Employee updated successfully!");

      // Refresh employees list
      const updatedEmployees = await getEmployees({
        role: user.role,
        siteId: user.siteId,
      });
      setEmployees(updatedEmployees.users);

      // Close edit form
      setShowEditForm(false);
      setEditingEmployee(null);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setUpdateMessage("");
      }, 3000);
    } catch (error) {
      console.error("Error updating employee:", error);
      let errorMessage = "Error updating employee. Please try again.";

      // Handle specific error messages from the server
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      setUpdateMessage(errorMessage);
      setTimeout(() => {
        setUpdateMessage("");
      }, 5000);
    }
  };

  const handleEditCancel = () => {
    setShowEditForm(false);
    setEditingEmployee(null);
  };

  return (
    <Container>
      <Sidebar user={user} />
      <Main>
        <GreetingNote
          userName={user ? `${user.firstName} ${user.lastName}` : "User"}
        />
        {updateMessage && <SuccessMessage>{updateMessage}</SuccessMessage>}
        <TableContainer>
          <HeaderSection>
            <PageTitle>Employees</PageTitle>
            <AddButton onClick={() => navigate("/employee/add")}>
              <MDBIcon fas icon="plus" />
              Add Employee
            </AddButton>
          </HeaderSection>
          <MDBTable align="middle">
            <MDBTableHead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Title</th>
                <th scope="col">Status</th>
                <th scope="col">Position</th>
                <th scope="col">Actions</th>
              </tr>
            </MDBTableHead>
            <MDBTableBody>
              {employees?.map((employee) => (
                <tr key={employee.id}>
                  <td>
                    <div className="d-flex">
                      <img
                        src={
                          employee.photo
                            ? `http://localhost:8888/${employee.photo}`
                            : defaultPhoto
                        }
                        alt=""
                        style={{ width: "45px", height: "45px" }}
                        className="rounded-circle"
                      />
                      <div className="ms-3 text-start">
                        <p className="fw-bold mb-1">
                          {employee.firstName} {employee.lastName}
                        </p>
                        <p className="text-muted mb-0">{employee.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <p className="fw-normal mb-1">{employee.position}</p>
                  </td>
                  <td>
                    <MDBBadge
                      color={
                        employee.status === "active" ? "success" : "danger"
                      }
                      pill
                      style={{ width: "fit-content" }}
                    >
                      {employee.status === "active" ? "Active" : "Inactive"}
                    </MDBBadge>
                  </td>
                  <td>{employee.department}</td>
                  <td>
                    {!(
                      user.role === "manager" && employee.role === "admin"
                    ) && (
                      <MDBBtn
                        color="link"
                        rounded
                        size="sm"
                        onClick={() => handleEdit(employee)}
                      >
                        Edit
                      </MDBBtn>
                    )}
                  </td>
                </tr>
              ))}
            </MDBTableBody>
          </MDBTable>
        </TableContainer>

        {/* Edit Form Overlay */}
        {showEditForm && (
          <EditFormOverlay>
            <EditFormContainer>
              <EmployeeForm
                initialData={editingEmployee}
                onSubmit={handleEditSubmit}
                onCancel={handleEditCancel}
                title="Edit Employee"
                action="edit"
                submitButtonText="Update Employee"
              />
            </EditFormContainer>
          </EditFormOverlay>
        )}
      </Main>
    </Container>
  );
};

export default Employee;

const Container = styled.div`
  display: flex;
  flex-direction: row;

  height: 100vh;
`;

const Main = styled.div`
  display: flex;
  flex: 1;
  background-color: #f0f0f0;
  padding: 20px;

  height: 100vh;
  flex-direction: column;
`;

const TableContainer = styled.div`
  width: fit-content;
  height: fit-content;
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 24px;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #333;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  position: relative;
  margin: 0;

  &::after {
    content: "";
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 40px;
    height: 3px;
    background: linear-gradient(90deg, #1976d2, #42a5f5);
    border-radius: 2px;
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: #1976d2;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #1565c0;
  }
`;

const EditFormOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const EditFormContainer = styled.div`
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  max-width: 95vw;
  width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const SuccessMessage = styled.div`
  background-color: #d4edda;
  color: #155724;
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 16px;
  border: 1px solid #c3e6cb;
  font-size: 14px;
  font-weight: 500;
`;
