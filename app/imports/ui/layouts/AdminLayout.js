import React from 'react'

const AdminLayout = ({ navbar, content }) => (
  <div id="main">
    <header>{navbar()}</header>
    {content()}
  </div>
)

export default AdminLayout
