import { useState } from "react";
import UserList from '../../components/User/List/List';
import UserCard from '../../components/User/Card/Card';
import RepositoryList from '../../components/Repository/List/List';
import RepositoryCard from '../../components/Repository/Card/Card';
import IssueList from '../../components/Issue/List/List';
import IssueCard from '../../components/Issue/Card/Card';
import FollowersQ from './graphql/FollowersQ';
import FollowingQ from './graphql/FollowingQ';
import IssuesQ from './graphql/IssuesQ';
import RepositoriesQ from './graphql/RepositoriesQ';
import { useQuery } from '@apollo/client';
import './dashboard.css'

export default function PagesDashboard() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [username] = useState(
    () => window.localStorage.getItem('github_username') || ''
  );

  const { data: followers, error: followerError } = useQuery(FollowersQ, {
    variables: {
      username,
    },
  });

  const { data: following, error: followingError } = useQuery(FollowingQ, {
    variables: {
      username,
    },
  });

  const { data: repositories, error: repositoryError } = useQuery(RepositoriesQ, {
    variables: {
      querySelectedUser: selectedUser ? selectedUser : "",
    },
  });

  const { data: issues, error: issuesError } = useQuery(IssuesQ, {
    variables: {
      querySelectedUser: selectedUser ? selectedUser : "",
      repoName: selectedRepo ? selectedRepo : "",
    },
  });

  const error = followerError || followingError || repositoryError || issuesError;

  return (
    <div>
      <header className='PagesDashboard__topbar'>
        {username}
      </header>
      {error ? (
        <div> Algo de errado </div>
      ) : (
        <section className='PagesDashboard__content'>
          <UserList title="Followers" loading={!followers?.user.followers.nodes.length}>
            {followers?.user.followers.nodes.map((follower) => (
              <UserCard
                key={follower.id}
                user={follower}
                isSelected={selectedUser === follower.login}
                onClick={() => setSelectedUser(follower.login)}
              />
            ))}
          </UserList>
          <UserList title="Following" loading={!following?.user.following.nodes.length}>
            {following?.user.following.nodes.map((following) => (
              <UserCard
                key={following.id}
                user={following}
                isSelected={selectedUser === following.login}
                onClick={() => setSelectedUser(following.login)}
              />
            ))}
          </UserList>
          <RepositoryList
            title="Repository"
            loading={selectedUser && repositories?.repositoryOwner == null}
          >
            {repositories?.repositoryOwner != null ? (
              repositories.repositoryOwner.repositories.nodes.map((repository) => {
                return (
                  <RepositoryCard
                    repository={repository}
                    key={repository.id}
                    isSelected={selectedRepo === repository.name}
                    onClick={() => setSelectedRepo(repository.name)}
                  />
                )
              })
            ) : 'Selecione um Usuário.'}
          </RepositoryList>
          <IssueList
            title="Issues"
            loading={selectedRepo && issues?.repositoryOwner == null}
          >
            {issues?.repositoryOwner?.repository != null ? (
              !issues.repositoryOwner.repository.issues.nodes.length ? (' Issues não encontradas.'
              ) : (
                issues.repositoryOwner.repository.issues.nodes.map((issue) => {
                  return (
                    <IssueCard
                      issue={issue}
                      key={issue.id}
                    />
                  )
                }))
            ) : 'Selecione um repositório.'}
          </IssueList>
        </section>
      )}
    </div>
  );
}