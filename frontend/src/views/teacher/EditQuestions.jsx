import React from 'react';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import QuestionList from './components/QuestionList';

const EditQuestions = () => {
  return (
    <PageContainer title="Edit Questions Page" description="this is Edit Questions page">
      <DashboardCard title="Edit Questions Page">
        <QuestionList />
      </DashboardCard>
    </PageContainer>
  );
};

export default EditQuestions;
