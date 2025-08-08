import React from 'react';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import EditQuestionForm from './components/EditQuestionForm';

const EditQuestions = () => {
  return (
    <PageContainer title="Edit Questions Page" description="this is Add Questions page">
      <DashboardCard title="Edit Questions Page">
        <EditQuestionForm />
      </DashboardCard>
    </PageContainer>
  );
};

export default EditQuestions;
