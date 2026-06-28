import React, { useState, useEffect } from 'react';
import { Search, BookOpen, ChevronRight, HelpCircle, ArrowLeft } from 'lucide-react';

function KnowledgeBase() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/kb')
      .then(res => res.json())
      .then(data => {
        setArticles(data);
        // Extract unique categories
        const cats = ['All', ...new Set(data.map(item => item.category))];
        setCategories(cats);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching KB:', err);
        setLoading(false);
      });
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredArticles = articles.filter(art => {
    const matchesCategory = selectedCategory === 'All' || art.category === selectedCategory;
    const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          art.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in select-none h-full flex flex-col">
      {/* KB Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400">
            Knowledge Base
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Search documentation, guides, and tutorials for help.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 text-slate-500" size={15} />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full bg-darkBg-card/45 border border-darkBg-border/50 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-96">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 mt-4">Indexing documentation corpus...</p>
        </div>
      ) : selectedArticle ? (
        /* ARTICLE DETAIL VIEW */
        <div className="glass-panel p-6 md:p-8 rounded-2xl border border-darkBg-border/50 max-w-3xl w-full mx-auto space-y-6">
          <button 
            onClick={() => setSelectedArticle(null)}
            className="flex items-center space-x-2 text-xs text-brand-400 hover:text-brand-300 font-bold transition-colors mb-4"
          >
            <ArrowLeft size={14} />
            <span>Back to Articles</span>
          </button>
          
          <div>
            <span className="text-[9px] font-bold text-brand-400 uppercase tracking-widest bg-brand-500/10 px-2.5 py-1 rounded-md">
              {selectedArticle.category}
            </span>
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-200 mt-3">{selectedArticle.title}</h2>
            <p className="text-[10px] text-slate-500 mt-1.5">
              Published on: {new Date(selectedArticle.created_at).toLocaleDateString()}
            </p>
          </div>

          <div className="text-xs text-slate-300 leading-relaxed space-y-4 border-t border-darkBg-border/25 pt-6 whitespace-pre-line">
            {selectedArticle.content}
          </div>
        </div>
      ) : (
        /* LIST VIEW WITH CATEGORIES SIDEBAR */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 items-start">
          
          {/* Categories Sidebar */}
          <div className="lg:col-span-1 glass-panel p-4 rounded-2xl border border-darkBg-border/50 space-y-1">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2.5 mb-3">Categories</h3>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  selectedCategory === cat 
                    ? 'bg-brand-600/20 text-brand-400' 
                    : 'text-slate-400 hover:bg-darkBg-hover/50 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Articles List */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredArticles.length === 0 ? (
              <div className="col-span-2 glass-panel p-12 rounded-2xl border border-darkBg-border/50 text-center text-slate-500 text-xs">
                No articles found matching your criteria.
              </div>
            ) : (
              filteredArticles.map(art => (
                <div
                  key={art.id}
                  onClick={() => setSelectedArticle(art)}
                  className="glass-panel glass-panel-hover p-5 rounded-2xl border border-darkBg-border/50 cursor-pointer flex flex-col justify-between h-40 group"
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">{art.category}</span>
                      <BookOpen size={14} className="text-slate-600 group-hover:text-brand-500 transition-colors" />
                    </div>
                    <h3 className="text-xs md:text-sm font-bold text-slate-200 mt-2 line-clamp-1 group-hover:text-brand-400 transition-colors">
                      {art.title}
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {art.content}
                    </p>
                  </div>
                  <div className="flex items-center text-[10px] font-bold text-brand-400 mt-4 group-hover:translate-x-1 transition-transform">
                    <span>Read article</span>
                    <ChevronRight size={12} className="ml-0.5" />
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}
    </div>
  );
}

export default KnowledgeBase;
