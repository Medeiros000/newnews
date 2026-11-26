import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { ToastContainer } from '@/components/ToastContainer';
import { adminService, newsService } from '@/services';
import { useToastStore } from '@/stores';
import {
  IconChartBar,
  IconNews,
  IconUsers,
  IconTags,
  IconEye,
  IconTrash,
  IconEdit,
  IconPlus,
  IconCheck,
  IconX,
} from '@tabler/icons-react';
import { TagInput } from '@/components/TagInput';

export function AdminPage() {
  const [activeSection, setActiveSection] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [newsList, setNewsList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const showToast = useToastStore((state) => state.showToastNotification);

  // Modal / Form state para criação/edição de notícia
  const [isEditingNews, setIsEditingNews] = useState(false);
  const [newsForm, setNewsForm] = useState({
    id: '',
    title: '',
    description: '',
    url: '',
    author: 'Redação',
    imageUrl: '',
    category: '',
    tags: [],
  });

  useEffect(() => {
    loadCurrentSection();
  }, [activeSection]);

  const loadCurrentSection = async () => {
    setIsLoading(true);
    try {
      if (activeSection === 'stats') {
        const res = await adminService.getStats();
        if (res.success) setStats(res.data);
      } else if (activeSection === 'users') {
        const res = await adminService.getUsers();
        if (res.success) setUsers(res.data);
      } else if (activeSection === 'news') {
        const [newsRes, catRes] = await Promise.all([
          newsService.getNews({ limit: 50 }),
          newsService.getCategories(),
        ]);
        if (newsRes.success) setNewsList(newsRes.data || []);
        if (catRes.success) setCategories(catRes.data || []);
      }
    } catch {
      showToast('Erro ao carregar dados administrativos.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleUserRole = async (user) => {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    try {
      await adminService.updateUser(user.id, { role: newRole });
      showToast(`Papel de ${user.name} alterado para ${newRole}`, 'success');
      loadCurrentSection();
    } catch {
      showToast('Falha ao atualizar papel do usuário', 'error');
    }
  };

  const handleToggleUserActive = async (user) => {
    try {
      await adminService.updateUser(user.id, { isActive: !user.isActive });
      showToast(`Status de ${user.name} atualizado.`, 'success');
      loadCurrentSection();
    } catch {
      showToast('Falha ao atualizar status', 'error');
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Tem certeza que deseja remover ${user.name}?`)) return;
    try {
      await adminService.deleteUser(user.id);
      showToast('Usuário removido com sucesso.', 'success');
      loadCurrentSection();
    } catch {
      showToast('Falha ao remover usuário', 'error');
    }
  };

  const handleDeleteNews = async (news) => {
    if (!window.confirm(`Deseja excluir a notícia "${news.title}"?`)) return;
    try {
      await adminService.deleteNews(news.id);
      showToast('Notícia removida com sucesso.', 'success');
      loadCurrentSection();
    } catch {
      showToast('Falha ao excluir notícia.', 'error');
    }
  };

  const handleSaveNews = async (e) => {
    e.preventDefault();
    try {
      if (newsForm.id) {
        await adminService.updateNews(newsForm.id, {
          title: newsForm.title,
          description: newsForm.description,
          url: newsForm.url,
          author: newsForm.author,
          image_url: newsForm.imageUrl,
          category: newsForm.category,
          tags: newsForm.tags,
        });
        showToast('Notícia atualizada com sucesso!', 'success');
      } else {
        await adminService.createNews({
          title: newsForm.title,
          description: newsForm.description,
          url: newsForm.url,
          author: newsForm.author,
          image_url: newsForm.imageUrl,
          category: newsForm.category,
          tags: newsForm.tags,
        });
        showToast('Notícia criada com sucesso!', 'success');
      }
      setIsEditingNews(false);
      setNewsForm({
        id: '',
        title: '',
        description: '',
        url: '',
        author: 'Redação',
        imageUrl: '',
        category: '',
        tags: [],
      });
      loadCurrentSection();
    } catch (err) {
      showToast(err.response?.data?.error || 'Erro ao salvar notícia.', 'error');
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-body">
      <Navbar />

      <main className="container-xl py-4 flex-grow-1">
        <header className="mb-4 d-flex justify-content-between align-items-center">
          <div>
            <h1 className="h3 fw-bold mb-1">Painel Administrativo</h1>
            <p className="text-secondary small mb-0">
              Controle global de métricas, moderação de notícias e usuários.
            </p>
          </div>
          {activeSection === 'news' && !isEditingNews && (
            <button
              className="btn btn-primary rounded-pill px-3"
              onClick={() => {
                setNewsForm({
                  id: '',
                  title: '',
                  description: '',
                  url: '',
                  author: 'Redação',
                  imageUrl: '',
                  category: categories[0]?.name || 'general',
                  tags: [],
                });
                setIsEditingNews(true);
              }}
            >
              <IconPlus size={18} className="me-1" /> Nova Notícia
            </button>
          )}
        </header>

        <div className="row g-4">
          <aside className="col-12 col-md-3">
            <div className="list-group rounded-3 shadow-sm border-0">
              <button
                type="button"
                className={`list-group-item list-group-item-action d-flex align-items-center gap-2 py-3 ${
                  activeSection === 'stats' ? 'active' : ''
                }`}
                onClick={() => {
                  setIsEditingNews(false);
                  setActiveSection('stats');
                }}
              >
                <IconChartBar size={18} />
                <span>Visão Geral (KPIs)</span>
              </button>
              <button
                type="button"
                className={`list-group-item list-group-item-action d-flex align-items-center gap-2 py-3 ${
                  activeSection === 'news' ? 'active' : ''
                }`}
                onClick={() => {
                  setIsEditingNews(false);
                  setActiveSection('news');
                }}
              >
                <IconNews size={18} />
                <span>Gerenciar Notícias</span>
              </button>
              <button
                type="button"
                className={`list-group-item list-group-item-action d-flex align-items-center gap-2 py-3 ${
                  activeSection === 'users' ? 'active' : ''
                }`}
                onClick={() => {
                  setIsEditingNews(false);
                  setActiveSection('users');
                }}
              >
                <IconUsers size={18} />
                <span>Gerenciar Usuários</span>
              </button>
            </div>
          </aside>

          <section className="col-12 col-md-9">
            {isLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Carregando painel...</span>
                </div>
              </div>
            ) : (
              <>
                {activeSection === 'stats' && stats && (
                  <div>
                    <div className="row g-3 mb-4">
                      <div className="col-6 col-lg-3">
                        <div className="card p-3 border-0 shadow-sm rounded-4 text-center">
                          <span className="text-secondary small fw-semibold">Total de Notícias</span>
                          <span className="fs-3 fw-bold text-primary mt-1">{stats.news.total}</span>
                        </div>
                      </div>
                      <div className="col-6 col-lg-3">
                        <div className="card p-3 border-0 shadow-sm rounded-4 text-center">
                          <span className="text-secondary small fw-semibold">Visualizações</span>
                          <span className="fs-3 fw-bold text-success mt-1">{stats.news.totalViews}</span>
                        </div>
                      </div>
                      <div className="col-6 col-lg-3">
                        <div className="card p-3 border-0 shadow-sm rounded-4 text-center">
                          <span className="text-secondary small fw-semibold">Usuários Cadastrados</span>
                          <span className="fs-3 fw-bold text-info mt-1">{stats.users.total}</span>
                        </div>
                      </div>
                      <div className="col-6 col-lg-3">
                        <div className="card p-3 border-0 shadow-sm rounded-4 text-center">
                          <span className="text-secondary small fw-semibold">Tags Criadas</span>
                          <span className="fs-3 fw-bold text-warning mt-1">{stats.tags.total}</span>
                        </div>
                      </div>
                    </div>

                    <div className="card border-0 shadow-sm rounded-4 p-4">
                      <h2 className="h6 fw-bold mb-3">Distribuição das Publicações</h2>
                      <div className="d-flex gap-3">
                        <span className="badge text-bg-success px-3 py-2 fs-6">
                          Publicadas: {stats.news.published}
                        </span>
                        <span className="badge text-bg-secondary px-3 py-2 fs-6">
                          Rascunhos: {stats.news.draft}
                        </span>
                        <span className="badge text-bg-warning px-3 py-2 fs-6">
                          Arquivadas: {stats.news.archived}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'users' && (
                  <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Nome</th>
                            <th>E-mail</th>
                            <th>Papel</th>
                            <th>Status</th>
                            <th>Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((u) => (
                            <tr key={u.id}>
                              <td className="fw-semibold">{u.name}</td>
                              <td className="text-muted small">{u.email}</td>
                              <td>
                                <span
                                  className={`badge ${
                                    u.role === 'ADMIN' ? 'text-bg-danger' : 'text-bg-secondary'
                                  }`}
                                >
                                  {u.role}
                                </span>
                              </td>
                              <td>
                                <span
                                  className={`badge ${
                                    u.isActive ? 'text-bg-success' : 'text-bg-danger'
                                  }`}
                                >
                                  {u.isActive ? 'Ativo' : 'Inativo'}
                                </span>
                              </td>
                              <td>
                                <div className="btn-group btn-group-sm">
                                  <button
                                    className="btn btn-outline-secondary"
                                    onClick={() => handleToggleUserRole(u)}
                                    title="Alternar Admin/User"
                                  >
                                    Mudar Papel
                                  </button>
                                  <button
                                    className="btn btn-outline-warning"
                                    onClick={() => handleToggleUserActive(u)}
                                    title="Ativar/Desativar"
                                  >
                                    {u.isActive ? 'Desativar' : 'Ativar'}
                                  </button>
                                  <button
                                    className="btn btn-outline-danger"
                                    onClick={() => handleDeleteUser(u)}
                                    title="Excluir"
                                  >
                                    <IconTrash size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeSection === 'news' && !isEditingNews && (
                  <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Título</th>
                            <th>Autor</th>
                            <th>Visualizações</th>
                            <th>Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {newsList.map((item) => (
                            <tr key={item.id}>
                              <td className="fw-semibold" style={{ maxWidth: 300 }}>
                                <div className="text-truncate">{item.title}</div>
                              </td>
                              <td className="text-muted small">{item.author}</td>
                              <td>{item.viewsCount || item.views_count || 0}</td>
                              <td>
                                <div className="btn-group btn-group-sm">
                                  <button
                                    className="btn btn-outline-primary"
                                    onClick={() => {
                                      setNewsForm({
                                        id: item.id,
                                        title: item.title,
                                        description: item.description,
                                        url: item.url,
                                        author: item.author,
                                        imageUrl: item.imageUrl || item.image_url,
                                        category: item.category || 'general',
                                        tags: item.tags ? item.tags.map((t) => t.name) : [],
                                      });
                                      setIsEditingNews(true);
                                    }}
                                  >
                                    <IconEdit size={14} />
                                  </button>
                                  <button
                                    className="btn btn-outline-danger"
                                    onClick={() => handleDeleteNews(item)}
                                  >
                                    <IconTrash size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeSection === 'news' && isEditingNews && (
                  <div className="card border-0 shadow-sm rounded-4 p-4">
                    <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                      <h2 className="h5 fw-bold mb-0">
                        {newsForm.id ? 'Editar Notícia' : 'Cadastrar Nova Notícia'}
                      </h2>
                      <button
                        className="btn btn-outline-secondary btn-sm rounded-pill"
                        onClick={() => setIsEditingNews(false)}
                      >
                        Cancelar
                      </button>
                    </div>

                    <form onSubmit={handleSaveNews}>
                      <div className="mb-3">
                        <label className="form-label small fw-semibold">Título</label>
                        <input
                          type="text"
                          className="form-control"
                          value={newsForm.title}
                          onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label small fw-semibold">Descrição / Conteúdo</label>
                        <textarea
                          className="form-control"
                          rows={4}
                          value={newsForm.description}
                          onChange={(e) => setNewsForm({ ...newsForm, description: e.target.value })}
                          required
                        />
                      </div>

                      <div className="row g-3 mb-3">
                        <div className="col-12 col-md-6">
                          <label className="form-label small fw-semibold">URL da Matéria</label>
                          <input
                            type="url"
                            className="form-control"
                            value={newsForm.url}
                            onChange={(e) => setNewsForm({ ...newsForm, url: e.target.value })}
                            required
                          />
                        </div>
                        <div className="col-12 col-md-6">
                          <label className="form-label small fw-semibold">Autor</label>
                          <input
                            type="text"
                            className="form-control"
                            value={newsForm.author}
                            onChange={(e) => setNewsForm({ ...newsForm, author: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="row g-3 mb-3">
                        <div className="col-12 col-md-6">
                          <label className="form-label small fw-semibold">URL da Imagem</label>
                          <input
                            type="url"
                            className="form-control"
                            value={newsForm.imageUrl}
                            onChange={(e) => setNewsForm({ ...newsForm, imageUrl: e.target.value })}
                            placeholder="https://exemplo.com/capa.jpg"
                          />
                        </div>
                        <div className="col-12 col-md-6">
                          <label className="form-label small fw-semibold">Categoria</label>
                          <select
                            className="form-select"
                            value={newsForm.category}
                            onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })}
                            required
                          >
                            <option value="">Selecione...</option>
                            {categories.map((c) => (
                              <option key={c.id} value={c.name}>
                                {c.label || c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="form-label small fw-semibold">Tags</label>
                        <TagInput
                          value={newsForm.tags}
                          onChange={(newTags) => setNewsForm({ ...newsForm, tags: newTags })}
                        />
                      </div>

                      <button type="submit" className="btn btn-primary rounded-pill px-4">
                        Salvar Notícia
                      </button>
                    </form>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>

      <ToastContainer />
    </div>
  );
}
